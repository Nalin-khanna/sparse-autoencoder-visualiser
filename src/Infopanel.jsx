const InfoPanel = ({ selectedInfo, textColor, isLightTheme }) => {
  if (!selectedInfo)
    return (
      <div
        className={`w-full h-full flex justify-center items-center ${
          isLightTheme ? "text-gray-600" : "text-gray-400"
        } text-2xl`}
      >
        <i> Select a connection of neuron to see its info </i>
      </div>
    );

  return (
    <div className={`${textColor} w-full h-full text-2xl`}>
      {selectedInfo.type === "neuron" ? (
        <>
          <h3 className="font-bold text-2xl">Neuron Info</h3>
          <div className="h-full w-full flex flex-col justify-center text-3xl items-center">
            <p>Layer: {selectedInfo.layer}</p>
            <p>Index: {selectedInfo.index}</p>
            <p>Value: {selectedInfo.value}</p>
          </div>
        </>
      ) : (
        <>
          <h3 className="font-bold text-2xl">Connection Info</h3>
          <div className="h-full w-full flex flex-col justify-center text-3xl items-center">
            <p> {selectedInfo.layer}</p>
            <p>
              Source → Target: {selectedInfo.sourceIndex} →{" "}
              {selectedInfo.targetIndex}
            </p>
            <p>Weight: {selectedInfo.weight}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default InfoPanel;
