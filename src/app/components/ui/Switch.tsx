"use client"
import { useState } from "react";
import clsx from "clsx";

const Switch = () => {

    const [isOn, setIsOn] = useState<boolean>(false);

    return (
        <button
            onClick={() => setIsOn(!isOn)}
            className={clsx(
                "w-16 h-7 rounded-2xl border border-gray-200",
                isOn ? "bg-green-500" : "bg-gray-200"
            )}
        >
            <div 
                className={clsx("w-7.5 h-6 rounded-full border border-gray-100 bg-white transition-transform",
                    isOn ? "translate-x-7.5" : "translate-x-0"
                )}>

            </div>
        </button>
    );
};

export default Switch;
