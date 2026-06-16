import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";

const STEPS = [
  { label: "Template", step: 1 },
  { label: "Recipients", step: 2 },
  { label: "Schedule", step: 3 },
  { label: "Review", step: 4 },
];

const CampaignStepper = ({ currentStep = 2 }) => {
  return (
    <div className="flex items-center gap-0 px-6 py-4 border-b border-gray-200 bg-white">
      {STEPS.map((s, i) => {
        const isCompleted = currentStep > s.step;
        const isActive = currentStep === s.step;
        const isUpcoming = currentStep < s.step;

        return (
          <div key={s.step} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  isCompleted
                    ? "bg-purple-600 text-white"
                    : isActive
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {isCompleted ? (
                  <FiCheck className="w-3.5 h-3.5" />
                ) : (
                  s.step
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  isActive
                    ? "text-purple-700"
                    : isCompleted
                    ? "text-purple-600"
                    : "text-gray-500"
                }`}
              >
                {s.label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div className="flex-1 mx-3">
                <div className="h-[2px] bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{
                      width: isCompleted ? "100%" : "0%",
                    }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-purple-600 rounded-full"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CampaignStepper;
