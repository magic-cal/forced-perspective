import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";

export const addControllersToScene = (scene) => {
  const controllers = [
    renderer.xr.getController(0),
    renderer.xr.getController(1),
  ].filter((controller) => !!controller);

  const controllerModelFactory = new XRControllerModelFactory();

  controllers.forEach((controller) => {
    controller = renderer.xr.getController(0);
    controller.addEventListener("selectstart", onSelectStart);
    controller.addEventListener("selectend", onSelectEnd);
    controller.addEventListener("connected", function (event) {
      this.add(buildController(event.data));
    });
    controller.addEventListener("disconnected", function () {
      this.remove(this.children[0]);
    });
    scene.add(controller);
  });

  controllerGrip1 = renderer.xr.getControllerGrip(0);
  controllerGrip1.add(
    controllerModelFactory.createControllerModel(controllerGrip1)
  );
  scene.add(controllerGrip1);

  controllerGrip2 = renderer.xr.getControllerGrip(1);
  controllerGrip2.add(
    controllerModelFactory.createControllerModel(controllerGrip2)
  );
  scene.add(controllerGrip2);
};
