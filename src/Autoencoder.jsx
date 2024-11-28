import React, { useContext, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import InfoPanel from "./Infopanel";
import { ThemeContext } from "./context/theme";
import CustomSwitch from "./components/customSwitch";
import { Sun } from "lucide-react";

const SparseAutoencoder = () => {
  const { isLightTheme, updateTheme } = useContext(ThemeContext);
  const textColor = isLightTheme ? "text-black" : "text-white";
  const iconColor = isLightTheme ? "#57534E" : "#E7E5E4";
  const bgColor = isLightTheme ? "bg-[#F5F5F1]" : "bg-[#1E1B1A]";
  const borderColor = isLightTheme ? "border-[#78716C]" : "border-[#D6D3D1]";
 const primaryColor = isLightTheme ? "bg-[#78716C]" : "bg-[#D6D3D1]";
 const accentColor = isLightTheme ? "accent-[#78716C]" : "accent-[#D6D3D1]";

  const mountRef = useRef(null);
  const [inputData, setInputData] = useState(new Array(10).fill(0.1));
  const [networkState, setNetworkState] = useState({
    input: new Array(10).fill(0.1),
    hidden: new Array(20).fill(0.01), // Sparse layer
    output: new Array(10).fill(0.1),
    weights1: Array(10)
      .fill()
      .map(() =>
        Array(20)
          .fill(0)
          .map(() => Math.random() * 2 - 1)
      ),
    weights2: Array(20)
      .fill()
      .map(() =>
        Array(10)
          .fill(0)
          .map(() => Math.random() * 2 - 1)
      ),
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
    const threshold = hidden.sort((a, b) => b - a)[
      Math.floor(hidden.length * 0.2)
    ];
    const sparseHidden = hidden.map((h) => (h >= threshold ? h : 0));

    // Hidden to output
    const output = networkState.weights2.map((row, i) => {
      const sum = row.reduce(
        (acc, weight, j) => acc + weight * sparseHidden[j],
        0
      );
      return sigmoid(sum);
    });

    return { hidden: sparseHidden, output };
  };

  const [globalScene, setGlobalScene] = useState(null);

  useEffect(() => {
    if (globalScene) {
      const color = isLightTheme ? 0xF5F5F1 : 0x1E1B1A;
      globalScene.background = new THREE.Color(color);
    }
  }, [isLightTheme, globalScene]);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1C1917);
    setGlobalScene(scene);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const updateCameraPosition = () => {
      const width = window.innerWidth;
      if (width < 768) {
        camera.position.z = 30; // Move camera back on mobile
        camera.position.y = 8;
      } else {
        camera.position.z = 20;
        camera.position.y = 5;
      }
      camera.updateProjectionMatrix();
    };
    updateCameraPosition();
    window.addEventListener('resize', updateCameraPosition);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const updateRendererSize = () => {
      const width = window.innerWidth;
      if (width < 768) { // mobile
        renderer.setSize(width * 0.95, width * 0.8); 
      } else if (width < 1024) { 
        renderer.setSize(width * 0.8, width * 0.7);
      } else { // desktop
        renderer.setSize(width * 0.55, window.innerHeight * 0.8);
      }
    };
    updateRendererSize();
    window.addEventListener('resize', updateRendererSize);
    
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
      const offset = (-(count - 1) * spacing) / 2;

      for (let i = 0; i < count; i++) {
        const geometry = new THREE.SphereGeometry(0.3, 32, 32);
        const material = new THREE.MeshPhongMaterial({
          color: new THREE.Color().setHSL(0.6, 1, 0.3 + activations[i] * 0.7),
        });
        const neuron = new THREE.Mesh(geometry, material);
        neuron.position.set(x, offset + i * spacing, 0);
        neuron.userData = {
          type: "neuron",
          layer: layerName,
          index: i,
          value: activations[i],
        };
        scene.add(neuron);
        neurons.push(neuron);
      }
      return neurons;
    };

    const createConnections = (
      sourceNeurons,
      targetNeurons,
      weights,
      layerName
    ) => {
      const connections = [];
      for (let i = 0; i < sourceNeurons.length; i++) {
        for (let j = 0; j < targetNeurons.length; j++) {
          const weight = weights[i][j];
          const geometry = new THREE.BufferGeometry();
          const material = new THREE.LineBasicMaterial({
            color: weight > 0 ? 0x00ff00 : 0xff0000,
            transparent: true,
            opacity: Math.abs(weight) * 0.5,
          });

          const points = [sourceNeurons[i].position, targetNeurons[j].position];
          geometry.setFromPoints(points);

          const line = new THREE.Line(geometry, material);
          line.userData = {
            type: "connection",
            layer: layerName,
            sourceIndex: i,
            targetIndex: j,
            weight: weight,
          };
          scene.add(line);
          connections.push(line);
        }
      }
      return connections;
    };

    // Create network
    const inputNeurons = createNeuronLayer(10, -8, networkState.input, "input");
    const hiddenNeurons = createNeuronLayer(
      20,
      0,
      networkState.hidden,
      "hidden"
    );
    const outputNeurons = createNeuronLayer(
      10,
      8,
      networkState.output,
      "output"
    );

    const connections1 = createConnections(
      inputNeurons,
      hiddenNeurons,
      networkState.weights1,
      "input to hidden"
    );
    const connections2 = createConnections(
      hiddenNeurons,
      outputNeurons,
      networkState.weights2,
      "hidden to output"
    );
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
        if (object.userData.type === "neuron") {
          setSelectedInfo({
            type: "neuron",
            layer: object.userData.layer,
            index: object.userData.index,
            value: object.userData.value.toFixed(4),
          });
        } else if (object.userData.type === "connection") {
          setSelectedInfo({
            type: "connection",
            layer: object.userData.layer,
            sourceIndex: object.userData.sourceIndex,
            targetIndex: object.userData.targetIndex,
            weight: object.userData.weight.toFixed(4),
          });
        }
      } else {
        setSelectedInfo(null);
      }
    };
    renderer.domElement.addEventListener("click", handleClick);

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
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
      renderer.domElement.removeEventListener("click", handleClick);
    };
  }, [networkState]);

  // Process new input data
  const processInput = () => {
    // Generate random input
    const newInput = Array(10)
      .fill(0)
      .map(() => Math.random());

    // Forward pass
    const { hidden, output } = forwardPass(newInput);

    // Update network state
    setNetworkState((prev) => ({
      ...prev,
      input: newInput,
      hidden: hidden,
      output: output,
    }));
  };

  // Update input handler
  const handleInputChange = (index, value) => {
    const newInputData = [...inputData];
    newInputData[index] = parseFloat(value);
    setInputData(newInputData);
  };

  // Random input generator
  const generateRandomInput = () => {
    const newRandomInput = Array(10)
      .fill(0)
      .map(() => Math.random());

    setInputData(newRandomInput);
  };

  // Submit input handler
  const submitInput = () => {
    // Forward pass with current input data
    const { hidden, output } = forwardPass(inputData);

    // Update network state
    setNetworkState((prev) => ({
      ...prev,
      input: inputData,
      hidden: hidden,
      output: output,
    }));
  };

  // Render Input Sliders Component
  const renderInputSliders = () => {
    const leftInputs = inputData.slice(0, 5);
    const rightInputs = inputData.slice(5);

    return (
      <div className="flex flex-col h-full gap-2 md:gap-4">
        <p
          className={`${
            isLightTheme ? "text-gray-600" : "text-gray-400"
          } text-sm md:text-lg`}
        >
          Modify these input values to be passed
        </p>
        <div className="flex flex-col md:flex-row justify-between gap-2 md:gap-0">
          {/* Left Side Inputs */}
          <div className="flex flex-col gap-2 md:gap-3 w-full md:w-[48%]">
            {leftInputs.map((value, index) => (
              <div
                key={`left-input-${index}`}
                className="flex items-center gap-2 md:gap-3"
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={value}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  className={`flex-grow ${accentColor} appearance-none h-2 bg-gray-200${
                    isLightTheme ? "/100" : "/30"
                  } rounded-full 
                             hover:bg-gray-300 transition-colors duration-200`}
                />
                <input
                  type="number"
                  value={value.toFixed(2)}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  min="0"
                  max="1"
                  step="0.01"
                  className="w-14 md:w-16 p-1 text-sm md:text-base border rounded text-center"
                />
              </div>
            ))}
          </div>

          {/* Right Side Inputs */}
          <div className="flex flex-col gap-2 md:gap-3 w-full md:w-[48%]">
            {rightInputs.map((value, index) => (
              <div
                key={`right-input-${index}`}
                className="flex items-center gap-2 md:gap-3"
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={value}
                  onChange={(e) => handleInputChange(index + 5, e.target.value)}
                  className={`flex-grow ${accentColor} appearance-none h-2 bg-gray-200${
                    isLightTheme ? "/100" : "/30"
                  } rounded-full 
                             hover:bg-gray-300 transition-colors duration-200`}
                />
                <input
                  type="number"
                  value={value.toFixed(2)}
                  onChange={(e) => handleInputChange(index + 5, e.target.value)}
                  min="0"
                  max="1"
                  step="0.01"
                  className="w-14 md:w-16 p-1 text-sm md:text-base border rounded text-center"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-0 justify-between mt-2 md:mt-4">
          <button
            onClick={generateRandomInput}
            className={`px-3 md:px-4 py-2 md:py-3 rounded-lg text-base md:text-lg font-semibold bg-transparent ${textColor} ${borderColor} border ${
              isLightTheme ? "hover:bg-[#52459F]/10" : "hover:bg-[#C8BCF6]/10"
            } w-full md:w-[48%] transition-colors`}
          >
            Random Input
          </button>
          <button
            onClick={submitInput}
            className={`px-3 md:px-4 py-2 md:py-3 text-base md:text-lg font-semibold rounded-lg ${primaryColor} ${
              isLightTheme ? "text-white" : "text-black"
            } ${
              isLightTheme ? "hover:bg-[#52459F]/90" : "hover:bg-[#C8BCF6]/90"
            }  w-full md:w-[48%] transition-colors`}
          >
            Submit
          </button>
        </div>
      </div>
    );
  };

  // Existing component return remains the same, but modify the inputs card
  return (
    <div className="min-h-screen w-full p-3 md:p-5 flex flex-col gap-3">
      <div className="mb-2 md:mb-4 space-y-4 w-full">
      <div className="w-full mb-2 md:mb-4">
        <div className="w-full flex flex-col md:flex-row justify-between gap-4">
          <div className="w-full md:w-[80%] flex flex-col gap-3">
            <h2 className={`text-xl md:text-4xl font-bold ${textColor}`}>
              Sparse Autoencoder Visualization
            </h2>
            <p className={`text-small md:text-xl ${isLightTheme ? "text-gray-600" : "text-gray-400"}`}>
              Active neurons are brighter. Green connections are positive weights, red are negative.
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 justify-end">
            <Sun color={iconColor} size={window.innerWidth < 768 ? 18 : 24}/>
            <span className={`text-sm md:text-lg ${isLightTheme ? "text-black" : "text-[#C8BCF6]"}`}>
              Light Mode
            </span>
            <CustomSwitch isLightTheme={isLightTheme} updateTheme={updateTheme} />
          </div>
        </div>
      </div>
    </div>
      <div className="flex flex-col lg:flex-row gap-3 justify-center h-full">
      <div className="w-full lg:w-[40%] flex flex-col gap-3">
        <div className={`${bgColor} flex flex-col p-3 md:p-5 rounded-3xl w-full h-full`}>
          <span className={`${textColor} text-base md:text-xl font-bold mb-2 md:mb-4`}>
            Inputs
          </span>
          {renderInputSliders()}
        </div>
          <div
            className={`${bgColor} flex flex-col p-3 rounded-xl md:rounded-3xl w-full`}
          >
            <InfoPanel
              selectedInfo={selectedInfo}
              textColor={textColor}
              isLightTheme={isLightTheme}
            />
          </div>
        </div>
        <div
          ref={mountRef}
          className={`${bgColor} flex justify-center items-center rounded-xl md:rounded-3xl h-[300px] md:h-full w-full lg:w-[60%]`}
        />
      </div>
    </div>
  );
};

export default SparseAutoencoder;
