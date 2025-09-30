"use client"
import clsx from "clsx";

type Props = {
    isOn?: boolean
    setIsOn?: (value: boolean) => void
}

const Switch = ({ isOn: controlledIsOn, setIsOn: controlledSetIsOn }: Props) => {
    // Use controlled state if provided, otherwise default to false
    const isOn = controlledIsOn ?? false
    const handleToggle = () => {
        if (controlledSetIsOn) {
            controlledSetIsOn(!isOn)
        }
    }

    return (
        <button
            onClick={handleToggle}
            className="w-12 h-6 rounded-full transition-all duration-200 ease-in-out focus:outline-none"
            style={{
                backgroundColor: isOn ? '#FFA05A' : '#f3f4f6',
                border: '2px solid rgba(255, 160, 90, 0.4)'
            }}
        >
            <div
                className={clsx(
                    "w-4 h-4 rounded-full bg-white transition-all duration-200 ease-in-out shadow-sm",
                    isOn ? "translate-x-6" : "translate-x-0.5"
                )}
                style={{
                    border: '1px solid rgba(0,0,0,0.1)'
                }}
            >
            </div>
        </button>
    );
};

export default Switch;
