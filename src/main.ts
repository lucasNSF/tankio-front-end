import kaboom, { EventController, GameObj, Vec2 } from "kaboom";

import { obstaclesCords } from "./obstaclesCords";

const game = document.querySelector("#game") as HTMLCanvasElement;

const k = kaboom({
  width: 1000,
  height: 600,
  canvas: game,
});

// * Background

k.loadSprite("level", "assets/Tankio-style-map.png");

k.camScale(k.vec2(4.3));

k.add([
  k.sprite("level"),
  k.anchor("topleft"),
  k.z(-1),
  k.pos(0, 0),
  "level",
  k.scale(k.vec2(1.4)),
]);

// * Tank

k.loadSprite("hull-A", "assets/hulls/Hull_A.png");
k.loadSprite("weapon-A", "assets/weapons/Weapon_A.png");

// 120, 140
const tank = k.make([
  k.sprite("hull-A"),
  k.pos(120, 140),
  k.scale(0.08),
  k.rotate(90),
  k.z(1),
  k.anchor("center"),
  { speed: 100, rotationSpeed: 2 },
  "tank",
  k.timer(),
  k.area({ scale: 0.8 }),
  k.body(),
]);

const weapon = k.make([
  k.sprite("weapon-A"),
  k.pos(0, 0),
  k.scale(1),
  k.anchor("center"),
  { rotationSpeed: 2 },
  k.rotate(0),
  k.area(),
  "weapon",
]);

weapon.onKeyPress("i", () => {
  if (weapon.angle > -90) {
    weapon.angle -= weapon.rotationSpeed;
    weapon.pos.x -= 1;
  }
});

weapon.onKeyPress("o", () => {
  if (weapon.angle < 90) {
    weapon.angle += weapon.rotationSpeed;
    weapon.pos.x += 1;
  }
});

tank.add(weapon);
k.add(tank);

// * Events

let activeRotationEvent: EventController | null = null;
let activeMovementKey: string | null = null;

type Orientation = "UP" | "DOWN" | "LEFT" | "RIGHT";

const orientationAngles: Record<Orientation, number[]> = {
  UP: [0, 360, -360],
  DOWN: [180, -180],
  LEFT: [270, -90],
  RIGHT: [90, -270],
};

function rotateObject(obj: GameObj, target: Orientation) {
  if (Math.abs(obj.angle) >= 360) obj.angle = 0;

  const targetOrientations = Reflect.get(orientationAngles, target);

  let nearestValue = targetOrientations[0];
  if (targetOrientations.length > 1) {
    const targetDiffs = targetOrientations.map((angle) =>
      Math.abs(angle - obj.angle)
    );
    const indexMinValue = targetDiffs.indexOf(Math.min(...targetDiffs));
    nearestValue = targetOrientations[indexMinValue];
  }

  const angleDirection = nearestValue > obj.angle ? "positive" : "negative";

  if (obj.angle === nearestValue) return;

  const epsilon = 0.5;

  if (!activeRotationEvent) {
    activeRotationEvent = obj.loop(0.05, () => {
      if (
        angleDirection === "positive" &&
        Math.abs(nearestValue - obj.angle) >= epsilon
      ) {
        obj.angle += obj.rotationSpeed;
      } else if (
        angleDirection === "negative" &&
        Math.abs(nearestValue - obj.angle) >= epsilon
      ) {
        obj.angle -= obj.rotationSpeed;
      } else {
        activeRotationEvent?.cancel();
        activeRotationEvent = null;
        tank.angle = nearestValue;
      }
    });
  }
}

tank.onKeyDown("w", (key: string) => {
  if (key !== activeMovementKey) {
    activeRotationEvent?.cancel();
    activeRotationEvent = null;
    activeMovementKey = key;
  }

  rotateObject(tank, "UP");

  if (orientationAngles["UP"].includes(tank.angle) && !activeRotationEvent) {
    tank.move(0, -tank.speed);
  }
});

tank.onKeyDown("a", (key: string) => {
  if (key !== activeMovementKey) {
    activeRotationEvent?.cancel();
    activeRotationEvent = null;
    activeMovementKey = key;
  }

  rotateObject(tank, "LEFT");

  if (orientationAngles["LEFT"].includes(tank.angle) && !activeRotationEvent) {
    tank.move(-tank.speed, 0);
  }
});

tank.onKeyDown("s", (key: string) => {
  if (key !== activeMovementKey) {
    activeRotationEvent?.cancel();
    activeRotationEvent = null;
    activeMovementKey = key;
  }

  rotateObject(tank, "DOWN");

  if (orientationAngles["DOWN"].includes(tank.angle) && !activeRotationEvent) {
    tank.move(0, tank.speed);
  }
});

tank.onKeyDown("d", (key: string) => {
  if (key !== activeMovementKey) {
    activeRotationEvent?.cancel();
    activeRotationEvent = null;
    activeMovementKey = key;
  }

  rotateObject(tank, "RIGHT");

  if (orientationAngles["RIGHT"].includes(tank.angle) && !activeRotationEvent) {
    tank.move(tank.speed, 0);
  }
});

tank.onKeyDown("p", () => {
  // TODO: Abstrair lógica de saber a direção que o tanque aponta
  if (tank.angle === 90 || tank.angle === -270) {
    tank.move(-tank.speed, 0);
  } else if (tank.angle === 270 || tank.angle === -90) {
    tank.move(tank.speed, 0);
  } else if (tank.angle === 0 || tank.angle === 360 || tank.angle === -360) {
    tank.move(0, tank.speed);
  } else if (tank.angle === 180 || tank.angle === -180) {
    tank.move(0, -tank.speed);
  }
});

k.loadSprite("bullet", "assets/Exhaust_Fire.png");

function resolveBulletAngle(): number {
  if (tank.angle === 0 || Math.abs(tank.angle) === 360) {
    return weapon.angle;
  } else if (tank.angle === 90 || tank.angle === -270) {
    return weapon.angle + 90;
  } else if (tank.angle === 270 || tank.angle === -90) {
    return weapon.angle + 270;
  } else {
    return weapon.angle + 180;
  }
}

function resolveBulletPosition(): Vec2 {
  const tankPos = tank.pos;
  const weaponPos = weapon.pos;

  console.log("tankPos", tankPos);
  console.log("weaponPos", weaponPos);

  const bulletCord = k.Vec2.fromAngle(weapon.angle);

  console.log("bulletCord", bulletCord);

  if (tank.angle === 0 || Math.abs(tank.angle) === 360) {
    return bulletCord;
  } else if (tank.angle === 90 || tank.angle === -270) {
    return bulletCord;
  } else if (tank.angle === 270 || tank.angle === -90) {
    return bulletCord;
  } else {
    return bulletCord;
  }
}

tank.onKeyPress("space", () => {
  // TODO: Travar o ângulo do tanque antes de atirar
  const bulletAngle = resolveBulletAngle();
  const bulletPosition = resolveBulletPosition();

  k.add([
    k.sprite("bullet"),
    "bullet",
    k.pos(bulletPosition),
    k.scale(0.2),
    k.anchor("center"),
    k.rotate(bulletAngle),
    k.z(1),
  ]);
});

function renderNearbyObstacles(playerPos: Vec2, distanceThreshold: number) {
  obstaclesCords.forEach(([x, y]) => {
    const dist = playerPos.dist(k.vec2(x, y));
    if (dist <= distanceThreshold) {
      k.add([
        k.rect(22, 22),
        k.area(),
        k.pos(x, y),
        k.color(255, 0, 0),
        k.opacity(0.5),
        k.body({ isStatic: true }),
        "obstacle",
      ]);
    }
  });
}

const LIM_X_LEFT = 119;
const LIM_X_RIGHT = k.width() - 445;

const LIM_Y_UP = 70;
const LIM_Y_DOWN = k.height() - 245;

tank.onUpdate(() => {
  k.destroyAll("obstacle");

  renderNearbyObstacles(tank.pos, 80);

  let camX = k.clamp(tank.pos.x, LIM_X_LEFT, LIM_X_RIGHT);
  let camY = k.clamp(tank.pos.y, LIM_Y_UP, LIM_Y_DOWN);

  k.camPos(camX, camY);
});
