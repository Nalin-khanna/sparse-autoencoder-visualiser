import { Moon, Sun } from "lucide-react";
import React from "react";

export default function CustomSwitch({ isLightTheme, updateTheme }) {
  return (
    <div
      onClick={() => updateTheme()}
      className={
        (isLightTheme ? "bg-[#C8BCF6]" : "bg-[#1F1F22]") +
        " hover:cursor-pointer h-[35px] w-[65px] rounded-full relative transition-all duration-200"
      }
    >
      <div
        className={
          (isLightTheme
            ? "translate-x-[25px] bg-[#09090a] text-[#C8BCF6]"
            : "translate-x-0 bg-[#C8BCF6] text-[#09090a]") +
          " absolute flex justify-center items-center h-[35px] w-[35px] rounded-full transition-all duration-200"
        }
      >
        <div
          className={
            "transition-opacity duration-200 " +
            (isLightTheme ? "opacity-100" : "opacity-0 hidden")
          }
        >
          <Moon size={15} />
        </div>
        <div
          className={
            "transition-opacity duration-200 " +
            (isLightTheme ? "opacity-0 hidden" : "opacity-100")
          }
        >
          <Sun size={15} />
        </div>
      </div>
    </div>
  );
}
