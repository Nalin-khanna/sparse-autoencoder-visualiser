const InfoPanel = ({ selectedInfo }) => {
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

export default InfoPanel;