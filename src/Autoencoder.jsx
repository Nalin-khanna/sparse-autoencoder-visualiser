import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import InfoPanel from './Infopanel';
const SparseAutoencoder = () => {
  const mountRef = useRef(null);
  const [inputData, setInputData] = useState(new Array(10).fill(0.1));
  const [networkState, setNetworkState] = useState({
    input: new Array(10).fill(0.1),
    hidden: new Array(20).fill(0.01), // Sparse layer 
    output: new Array(10).fill(0.1),
    weights1: Array(10).fill().map(() => Array(20).fill(0).map(() => Math.random() * 2 - 1)),
    weights2: Array(20).fill().map(() => Array(10).fill(0).map(() => Math.random() * 2 - 1))
  });
  const [selectedInfo, setSelectedInfo] = useState(null);


  // Activation functions
  const relu = (x) => Math.max(0, x);
  const sigmoid = (x) => 1 / (1 + Math.exp(-x));

  // Forward pass 
  const forwardPass = (input) => {
    // Input 
    const hidden = networkState.weights1.map((row, i) => {
      const sum = row.reduce((acc, weight, j) => acc + weight * input[j], 0);
      return relu(sum); // ReLU activation for sparsity
    });

    // sparsity constraint 
    const threshold = hidden.sort((a, b) => b - a)[Math.floor(hidden.length * 0.2)];
    const sparseHidden = hidden.map(h => h >= threshold ? h : 0);

    // Hidden to output 
    const output = networkState.weights2.map((row, i) => {
      const sum = row.reduce((acc, weight, j) => acc + weight * sparseHidden[j], 0);
      return sigmoid(sum);
    });

    return { hidden: sparseHidden, output };
  };

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20;
    camera.position.y = 5;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth * 0.65, window.innerHeight * 0.65);
    mountRef.current.appendChild(renderer.domElement);
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

   
    const createNeuronLayer = (count, x, activations, layerName) => { 
      const neurons = [];
      const spacing = 1.5;
      const offset = -(count - 1) * spacing / 2;
      
      for (let i = 0; i < count; i++) {
        const geometry = new THREE.SphereGeometry(0.3, 32, 32);
        const material = new THREE.MeshPhongMaterial({
          color: new THREE.Color().setHSL(0.6, 1, 0.3 + activations[i] * 0.7)
        });
        const neuron = new THREE.Mesh(geometry, material);
        neuron.position.set(x, offset + i * spacing, 0);
        neuron.userData = {
          type: 'neuron',
          layer: layerName,  
          index: i,
          value: activations[i]
        };
        scene.add(neuron);
        neurons.push(neuron);
      }
      return neurons;
    };

    
    const createConnections = (sourceNeurons, targetNeurons, weights, layerName) => {
      const connections = [];
      for (let i = 0; i < sourceNeurons.length; i++) {
        for (let j = 0; j < targetNeurons.length; j++) {
          const weight = weights[i][j];
          const geometry = new THREE.BufferGeometry();
          const material = new THREE.LineBasicMaterial({ 
            color: weight > 0 ? 0x00ff00 : 0xff0000,
            transparent: true,
            opacity: Math.abs(weight) * 0.5
          });
          
          const points = [
            sourceNeurons[i].position,
            targetNeurons[j].position
          ];
          geometry.setFromPoints(points);
          
          const line = new THREE.Line(geometry, material);
          line.userData = {
            type: 'connection',
            layer: layerName,
            sourceIndex: i,
            targetIndex: j,
            weight: weight
          };
          scene.add(line);
          connections.push(line);
        }
      }
      return connections;
    };

    // Create network
    const inputNeurons = createNeuronLayer(10, -8, networkState.input, 'input');
    const hiddenNeurons = createNeuronLayer(20, 0, networkState.hidden, 'hidden');
    const outputNeurons = createNeuronLayer(10, 8, networkState.output, 'output');
    
    const connections1 = createConnections(inputNeurons, hiddenNeurons, networkState.weights1, 'input to hidden');
    const connections2 = createConnections(hiddenNeurons, outputNeurons, networkState.weights2, 'hidden to output');
    const handleClick = (event) => {
      // YEH FUNCTION CHATGPT SE LIKHWAYA HAI 
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
    renderer.domElement.addEventListener('click', handleClick);


    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // SAAF SAFAI KARI JAA RAHI HAI
    return () => {
      
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
      renderer.domElement.removeEventListener('click', handleClick);
    };
  }, [networkState]);

  // Process new input data
  const processInput = () => {
    // Generate random input
    const newInput = Array(10).fill(0).map(() => Math.random());
    
    // Forward pass
    const { hidden, output } = forwardPass(newInput);
    
    // Update network state
    setNetworkState(prev => ({
      ...prev,
      input: newInput,
      hidden: hidden,
      output: output
    }));
  };

  const renderInfoPanel = () => {
    if (!selectedInfo) return null;

    return (
      <div className="absolute top-4 right-4 bg-white p-4 rounded shadow-lg">
        {selectedInfo.type === 'neuron' ? (
          <>
            <h3 className="font-bold">Neuron Info</h3>
            <p>Layer: {selectedInfo.layer}</p>
            <p>Index: {selectedInfo.index}</p>
            <p>Value: {selectedInfo.value}</p>
          </>
        ) : (
          <>
            <h3 className="font-bold">Connection Info</h3>
            <p>Layer: {selectedInfo.layer}</p>
            <p>Source → Target: {selectedInfo.sourceIndex} → {selectedInfo.targetIndex}</p>
            <p>Weight: {selectedInfo.weight}</p>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col items-center relative">
      <div className="mb-4 space-y-4">
        {/* Header */}
    <div className="w-full max-w-4xl mb-4">
      <div className="text-center">
        <h2 className="text-xl font-bold">Sparse Autoencoder Visualization</h2>
        <p className="text-sm text-gray-600">
          Active neurons are brighter. Green connections are positive weights, red are negative.
        </p>
      </div>
    </div>
        <button 
          onClick={processInput}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Process Random Input
        </button>
      </div>
      {/* Info Panel */}
      
      <div ref={mountRef} className="w-4/5 h-4/5" />
       <InfoPanel selectedInfo={selectedInfo} />
    </div>
  );
};

export default SparseAutoencoder;