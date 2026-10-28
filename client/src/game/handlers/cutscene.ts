import {
  ENCOUNTER_FADE,
  ENCOUNTER_HOLD,
  PATH_ARRIVAL,
} from "@server/globals";
import {
  Cutscene,
  Direction,
  EncounterStart,
  EntityName,
  Event,
  Input,
  StateName,
  Waypoint,
} from "@server/types";
import { handlers } from ".";
import EventBus from "../EventBus";
import type { Player } from "../Player";
import type { Villain } from "../Villain";
import type { MainScene } from "../scenes/Main";

const STUCK_INTERVAL = 500;
const STUCK_THRESHOLD = 1;

export const cutscene = {
  villain: (main: MainScene, entityId: string): Villain | null => {
    const entity = main.managers.entities.get(entityId);
    return entity?.name === EntityName.VILLAIN ? (entity as Villain) : null;
  },

  start: (main: MainScene, data: EncounterStart): void => {
    const villain = cutscene.villain(main, data.entityId);
    if (villain) villain.isEncountered = true;

    const player = main.managers.players.player;
    if (!player) return;

    const camera = player.scene.cameraManager;
    const time = player.scene.time;
    const slot = data.slots[player.id];

    const rows = Object.values(data.slots);
    const count = Math.max(1, rows.length);
    const fx = rows.reduce((sum, s) => sum + s.from.x, 0) / count || data.x;
    const fy = rows.reduce((sum, s) => sum + s.from.y, 0) / count || data.y;

    const script: Cutscene | null = slot
      ? {
          facing: data.facing === Direction.UP ? Direction.DOWN : Direction.UP,
          path: [slot.to],
          stuck: {
            lastPosition: { x: 0, y: 0 },
            lastCheck: 0,
            interval: STUCK_INTERVAL,
          },
          walking: false,
          arrived: false,
        }
      : null;

    player.cutscene = script;

    camera.fade(true, ENCOUNTER_FADE, () => {
      if (slot) cutscene.teleport(player, slot.from);
      camera.focus((data.x + fx) / 2, (data.y + fy) / 2);

      time.delayedCall(ENCOUNTER_HOLD, () => {
        camera.fade(false, ENCOUNTER_FADE, () => {});

        if (!script || player.cutscene !== script) return;

        script.walking = true;
        script.stuck.lastPosition = { x: player.x, y: player.y };
        script.stuck.lastCheck = time.now;
      });
    });
  },

  teleport: (player: Player, to: Waypoint): void => {
    if (player.state !== StateName.IDLE) player.transitionTo(StateName.IDLE);

    const at = handlers.path.position(player);
    const x = player.x + to.x - at.x;
    const y = player.y + to.y - at.y;
    const body = player.body as Phaser.Physics.Arcade.Body | undefined;

    if (body) body.reset(x, y);
    else player.setPosition(x, y);
  },

  walk: (
    player: Player,
    script: Cutscene,
  ): Pick<Input, "facing" | "moving"> & Partial<Input> => {
    if (script.walking && !script.arrived) {
      const input = handlers.path.follow(
        player,
        script.path,
        PATH_ARRIVAL,
        false,
      );
      const stuck = handlers.path.stuck(
        player,
        script.stuck,
        player.scene.time.now,
        STUCK_THRESHOLD,
      );

      if (input?.moving?.length && !stuck)
        return {
          ...input,
          facing: input.facing ?? player.facing,
          moving: input.moving,
        };

      script.arrived = true;
      player.scene.game.events.emit(Event.CUTSCENE_READY);
    }

    return { facing: script.facing, moving: [] };
  },

  end: (main: MainScene, entityId: string): void => {
    EventBus.emit(Event.ENTITY_DIALOGUE_END, entityId);

    const engage = () => {
      const villain = cutscene.villain(main, entityId);
      if (villain) villain.isEngaged = true;
    };

    const player = main.managers.players.player;
    if (!player) return engage();

    const camera = player.scene.cameraManager;
    player.cutscene = null;

    camera.fade(true, ENCOUNTER_FADE, () => {
      camera.release(player);
      camera.fade(false, ENCOUNTER_FADE, engage);
    });
  },
};
