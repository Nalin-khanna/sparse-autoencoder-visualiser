const handleClickNeuron = (event, setSelectedInfo, raycaster, mouse, camera, scene) => {
  // Calculate mouse position in normalized device coordinates
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  // Update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length > 0) {
    const object = intersects[0].object;
    if (object.userData.type === 'neuron') {
      setSelectedInfo({
        type: 'neuron',
        layer: object.userData.layer,
        index: object.userData.index,
        value: object.userData.value.toFixed(4)
      });
    } else if (object.userData.type === 'connection') {
      setSelectedInfo({
        type: 'connection',
        layer: object.userData.layer,
        sourceIndex: object.userData.sourceIndex,
        targetIndex: object.userData.targetIndex,
        weight: object.userData.weight.toFixed(4)
      });
    }
  } else {
    setSelectedInfo(null);
  }
};

export default handleClickNeuron;