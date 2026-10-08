import {
  AmbienceConfig,
  AmbienceLayer,
  ComponentName,
  MapName,
  PipelineName,
  TimePhase,
} from "@server/types";
import { MainScene } from "../scenes/Main";
import { configs } from "@server/configs";
import { AmbiencePipeline } from "../pipelines/Ambience";
import { DAY, PHASE_STARTS, PHASE_TRANSITION_DURATION } from "@server/globals";
import { LightComponent } from "../components/Light";
import { GlimmerComponent } from "../components/Glimmer";

export class DaycycleManager {
  private scene: MainScene;
  private current: TimePhase | null = null;
  private ambientColors = new Map<
    string,
    { r: number; g: number; b: number }
  >();

  private clock = 0;
  private settle = 0;
  private tint = -1;

  constructor(scene: MainScene) {
    this.scene = scene;
  }

  get phase(): TimePhase | null {
    return this.current;
  }

  setClock(current: number) {
    this.clock = current;
  }

  update(delta: number) {
    this.clock = (this.clock + delta) % DAY;

    if (this.settle > 0) {
      this.settle -= delta;
      return;
    }

    if (!this.current) return;

    const preset: AmbienceConfig = configs.time.phases[this.current];
    if (preset.depth == null) return;

    let start = 0;
    let end = 1;

    for (let i = 0; i < PHASE_STARTS.length; i++) {
      if (PHASE_STARTS[i].phase !== this.current) continue;

      start = PHASE_STARTS[i].start;
      end = PHASE_STARTS[i + 1]?.start ?? 1;
    }

    const progress = Phaser.Math.Clamp(
      (this.clock / DAY - start) / (end - start),
      0,
      1,
    );
    const depth = Math.sin(Math.PI * progress);

    const r = Math.round(
      Phaser.Math.Linear(
        (preset.ambient >> 16) & 0xff,
        (preset.depth >> 16) & 0xff,
        depth,
      ),
    );
    const g = Math.round(
      Phaser.Math.Linear(
        (preset.ambient >> 8) & 0xff,
        (preset.depth >> 8) & 0xff,
        depth,
      ),
    );
    const b = Math.round(
      Phaser.Math.Linear(preset.ambient & 0xff, preset.depth & 0xff, depth),
    );

    const tint = Phaser.Display.Color.GetColor(r, g, b);
    if (tint === this.tint) return;

    this.tint = tint;

    this._getOutdoorScenes().forEach((s) => {
      s.lights.setAmbientColor(tint);

      const state = this.ambientColors.get(s.scene.key);

      if (state) {
        state.r = r;
        state.g = g;
        state.b = b;
      } else this.ambientColors.set(s.scene.key, { r, g, b });
    });
  }

  setPhase(phase: TimePhase, animate: boolean) {
    if (animate) {
      const entry = PHASE_STARTS.find((p) => p.phase === phase);

      if (entry) this.clock = entry.start * DAY;
      this.settle = PHASE_TRANSITION_DURATION;
    }

    this.current = phase;
    this.tint = -1;
    const preset = configs.time.phases[phase];

    const pipelines = this._getPipelines();
    pipelines.forEach((pipeline) => {
      if (animate) this._transitionTo(pipeline, preset);
      else this._apply(pipeline, preset);

      this._applySun(pipeline, preset, animate);
    });

    const scenes = this._getOutdoorScenes();
    scenes.forEach((s) => {
      const color = Phaser.Display.Color.IntegerToColor(preset.ambient);

      if (animate) this._transitionAmbient(s, color);
      else {
        s.lights.setAmbientColor(preset.ambient);
        this.ambientColors.set(s.scene.key, {
          r: color.red,
          g: color.green,
          b: color.blue,
        });
      }
    });

    this._scaleLights(preset.lightIntensity, animate);
  }

  private _getOutdoorScenes(): Phaser.Scene[] {
    return this.scene.scene.manager
      .getScenes(false)
      .filter((s) => !configs.maps[s.scene.key as MapName]?.isIndoor);
  }

  private _getPipelines(): AmbiencePipeline[] {
    return this._getOutdoorScenes()
      .filter((s) => s.cameras.main)
      .map(
        (s) =>
          s.cameras.main.getPostPipeline(
            PipelineName.AMBIENCE,
          ) as AmbiencePipeline,
      )
      .flat()
      .filter(Boolean) as AmbiencePipeline[];
  }

  private _transitionAmbient(
    scene: Phaser.Scene,
    target: Phaser.Display.Color,
  ) {
    if (!this.ambientColors.has(scene.scene.key))
      this.ambientColors.set(scene.scene.key, { r: 255, g: 255, b: 255 });

    const state = this.ambientColors.get(scene.scene.key)!;

    this.scene.tweens.add({
      targets: state,
      r: target.red,
      g: target.green,
      b: target.blue,
      duration: PHASE_TRANSITION_DURATION,
      ease: "Sine.easeInOut",
      onUpdate: () => {
        scene.lights.setAmbientColor(
          Phaser.Display.Color.GetColor(
            Math.round(state.r),
            Math.round(state.g),
            Math.round(state.b),
          ),
        );
      },
    });
  }

  private _transitionTo(pipeline: AmbiencePipeline, config: AmbienceConfig) {
    const mod = pipeline.layer(AmbienceLayer.DAYCYCLE);

    if (mod.coolness == null) {
      this._apply(pipeline, config);
      return;
    }

    this.scene.tweens.add({
      targets: mod,
      coolness: config.coolness,
      saturation: config.saturation,
      contrast: config.contrast,
      vignette: config.vignette.strength,
      duration: PHASE_TRANSITION_DURATION,
      ease: "Sine.easeInOut",
    });
  }

  private _applySun(
    pipeline: AmbiencePipeline,
    config: AmbienceConfig,
    animate: boolean,
  ) {
    const color = Phaser.Display.Color.IntegerToColor(config.sun.color);
    const target = {
      r: color.red / 255,
      g: color.green / 255,
      b: color.blue / 255,
      intensity: config.sun.intensity,
    };

    if (animate)
      this.scene.tweens.add({
        targets: pipeline.sun,
        ...target,
        duration: PHASE_TRANSITION_DURATION,
        ease: "Sine.easeInOut",
      });
    else Object.assign(pipeline.sun, target);
  }

  private _apply(pipeline: AmbiencePipeline, config: AmbienceConfig) {
    const mod = pipeline.layer(AmbienceLayer.DAYCYCLE);
    mod.coolness = config.coolness;
    mod.saturation = config.saturation;
    mod.contrast = config.contrast;
    mod.vignette = config.vignette.strength;
  }

  private _scaleLights(multiplier: number, animate: boolean) {
    const entities = this.scene.managers.entities.entities;

    for (const [_, entity] of entities) {
      const light = entity.getComponent<LightComponent>(ComponentName.LIGHT);

      if (light) {
        const target = light.intensity * multiplier;

        if (animate)
          this.scene.tweens.add({
            targets: light.light,
            intensity: light.active ? target : 0,
            duration: PHASE_TRANSITION_DURATION,
            ease: "Sine.easeInOut",
          });
        else light.light.intensity = light.active ? target : 0;
      }

      const glimmer = entity.getComponent<GlimmerComponent>(
        ComponentName.GLIMMER,
      );

      if (glimmer) {
        const target = glimmer.intensity * multiplier;

        if (animate)
          this.scene.tweens.add({
            targets: glimmer.light,
            intensity: glimmer.active ? target : 0,
            duration: PHASE_TRANSITION_DURATION,
            ease: "Sine.easeInOut",
          });
        else glimmer.light.intensity = glimmer.active ? target : 0;
      }
    }
  }
}
