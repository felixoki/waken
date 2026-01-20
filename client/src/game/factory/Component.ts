import {
  BodyConfig,
  CollectorConfig,
  ComponentConfig,
  ComponentName,
  TextureConfig,
  TransitionConfig,
} from "@server/types";
import { Entity } from "../Entity";
import { Component } from "../components/Component";
import { PointableComponent } from "../components/Pointable";
import { BehaviorQueue } from "../components/BehaviorQueue";
import { BodyComponent } from "../components/Body";
import { configs } from "@server/configs";
import { AnimationComponent } from "../components/Animation";
import { TextureComponent } from "../components/Texture";
import { PickableComponent } from "../components/Pickable";
import { InventoryComponent } from "../components/Inventory";
import { HoverableComponent } from "../components/Hoverable";
import { DamageableComponent } from "../components/Damageable";
import { TransitionComponent } from "../components/Transition";
import { InteractableComponent } from "../components/Interactable";
import { CollectorComponent } from "../components/Collector";

export class ComponentFactory {
  static create(
    cfgs: ComponentConfig[],
    entity: Entity,
  ): Map<ComponentName, Component> {
    const components = new Map<ComponentName, Component>();

    for (const config of cfgs) {
      const map: Record<ComponentName, Component> = {
        [ComponentName.ANIMATION]: new AnimationComponent(
          entity,
          configs.animations[entity.name] ?? {},
          false,
        ),
        [ComponentName.BEHAVIOR_QUEUE]: new BehaviorQueue(entity),
        [ComponentName.BODY]: new BodyComponent(
          entity,
          (config as { name: ComponentName.BODY; config: BodyConfig }).config,
        ),
        [ComponentName.POINTABLE]: new PointableComponent(entity),
        [ComponentName.TEXTURE]: new TextureComponent(
          entity,
          (
            config as {
              name: ComponentName.TEXTURE;
              config: TextureConfig;
            }
          ).config,
          `${entity.name}_texture`,
        ),
        [ComponentName.PICKABLE]: new PickableComponent(entity),
        [ComponentName.INVENTORY]: new InventoryComponent(),
        [ComponentName.HOVERABLE]: new HoverableComponent(entity),
        [ComponentName.HOTBAR]: null!,
        [ComponentName.DAMAGEABLE]: new DamageableComponent(),
        [ComponentName.TRANSITION]: new TransitionComponent(
          entity,
          (
            config as {
              name: ComponentName.TRANSITION;
              config: TransitionConfig;
            }
          ).config,
        ),
        [ComponentName.INTERACTABLE]: new InteractableComponent(entity),
        [ComponentName.COLLECTOR]: new CollectorComponent(
          entity,
          (config as { name: ComponentName.COLLECTOR; config: CollectorConfig })
            .config,
        ),
      };

      if (map[config.name]) components.set(config.name, map[config.name]);
    }

    return components;
  }
}
