import { ComponentConfig, ComponentName } from "@server/types";
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
import { BounceComponent } from "../components/Bounce";
import { LightComponent } from "../components/Light";
import { TextureAnimationComponent } from "../components/TextureAnimation";

export class ComponentFactory {
  static create(
    components: ComponentConfig[],
    entity: Entity,
  ): Map<ComponentName, Component> {
    const map = new Map<ComponentName, Component>();

    for (const component of components) {
      let comp: Component | null = null;

      switch (component.name) {
        case ComponentName.ANIMATION:
          comp = new AnimationComponent(
            entity,
            configs.animations[entity.name] ?? {},
          );
          break;
        case ComponentName.BEHAVIOR_QUEUE:
          comp = new BehaviorQueue(entity);
          break;
        case ComponentName.BODY:
          comp = new BodyComponent(entity, component.config);
          break;
        case ComponentName.POINTABLE:
          comp = new PointableComponent(entity);
          break;
        case ComponentName.TEXTURE:
          comp = new TextureComponent(
            entity,
            component.config,
            `${entity.name}_texture`,
          );
          break;
        case ComponentName.PICKABLE:
          comp = new PickableComponent(entity);
          break;
        case ComponentName.INVENTORY:
          comp = new InventoryComponent();
          break;
        case ComponentName.HOVERABLE:
          comp = new HoverableComponent(entity);
          break;
        case ComponentName.DAMAGEABLE:
          comp = new DamageableComponent();
          break;
        case ComponentName.TRANSITION:
          comp = new TransitionComponent(entity, component.config);
          break;
        case ComponentName.INTERACTABLE:
          comp = new InteractableComponent(entity);
          break;
        case ComponentName.COLLECTOR:
          comp = new CollectorComponent(entity, component.config);
          break;
        case ComponentName.BOUNCE:
          comp = new BounceComponent(entity);
          break;
        case ComponentName.LIGHT:
          comp = new LightComponent(entity, component.config);
          break;
        case ComponentName.TEXTURE_ANIMATION:
          comp = new TextureAnimationComponent(entity, component.config);
          break;
      }

      if (comp) map.set(component.name, comp);
    }

    return map;
  }
}
