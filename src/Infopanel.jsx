const InfoPanel = ({ selectedInfo, textColor, isLightTheme }) => {
  if (!selectedInfo)
    return (
      <div
        className={`w-full h-full flex justify-center items-center p-2 md:p-4 ${
          isLightTheme ? "text-gray-600" : "text-gray-400"
        } text-sm md:text-base`}
      >
        <div className="flex flex-col items-center gap-2">
          <i className="text-center">Select a connection or neuron to view details</i>
          <div className={`w-16 h-0.5 ${isLightTheme ? "bg-gray-300" : "bg-gray-700"}`}></div>
        </div>
      </div>
    );

  const valueColor = isLightTheme ? "text-[#78716C]" : "text-[#D6D3D1]";
  const borderColor = isLightTheme ? "border-gray-200" : "border-gray-800";
  
  return (
    <div className={`${textColor} w-full h-full p-2 md:p-4`}>
      {selectedInfo.type === "neuron" ? (
        <>
          <h3 className="font-bold text-base md:text-lg mb-2 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLightTheme ? "bg-[#78716C]" : "bg-[#D6D3D1]"}`}></div>
            Neuron Info
          </h3>
          <div className="h-full w-full flex flex-col gap-2">
            <div className={`p-2 rounded-lg border ${borderColor} bg-opacity-5 backdrop-blur-sm`}>
              <p className="text-xs md:text-sm opacity-80">Layer</p>
              <p className={`text-sm md:text-base font-medium ${valueColor}`}>{selectedInfo.layer}</p>
            </div>
            <div className={`p-2 rounded-lg border ${borderColor} bg-opacity-5 backdrop-blur-sm`}>
              <p className="text-xs md:text-sm opacity-80">Index</p>
              <p className={`text-sm md:text-base font-medium ${valueColor}`}>{selectedInfo.index}</p>
            </div>
            <div className={`p-2 rounded-lg border ${borderColor} bg-opacity-5 backdrop-blur-sm`}>
              <p className="text-xs md:text-sm opacity-80">Value</p>
              <p className={`text-sm md:text-base font-medium ${valueColor}`}>{selectedInfo.value}</p>
            </div>
          </div>
        </>
      ) : (
        <>
          <h3 className="font-bold text-base md:text-lg mb-2 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLightTheme ? "bg-[#78716C]" : "bg-[#D6D3D1]"}`}></div>
            Connection Info
          </h3>
          <div className="h-full w-full flex flex-col gap-2">
            <div className={`p-2 rounded-lg border ${borderColor} bg-opacity-5 backdrop-blur-sm`}>
              <p className="text-xs md:text-sm opacity-80">Layer</p>
              <p className={`text-sm md:text-base font-medium ${valueColor}`}>{selectedInfo.layer}</p>
            </div>
            <div className={`p-2 rounded-lg border ${borderColor} bg-opacity-5 backdrop-blur-sm`}>
              <p className="text-xs md:text-sm opacity-80">Connection</p>
              <p className={`text-sm md:text-base font-medium ${valueColor}`}>
                {selectedInfo.sourceIndex} → {selectedInfo.targetIndex}
              </p>
            </div>
            <div className={`p-2 rounded-lg border ${borderColor} bg-opacity-5 backdrop-blur-sm`}>
              <p className="text-xs md:text-sm opacity-80">Weight</p>
              <p className={`text-sm md:text-base font-medium ${valueColor}`}>{selectedInfo.weight}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InfoPanel;
