import React from "react";
import { CheckCircle2 } from "lucide-react";
import { STATUSES } from "../constants";

export default function StatusPipeline({ status }) {
  const isReopened = status === "Reopened";
  const activeIdx = isReopened ? 1 : STATUSES.indexOf(status);

  return (
    <div className="flex items-center w-full">
      {STATUSES.map((s, i) => {
        const done = i < activeIdx || (i === activeIdx && !isReopened);
        const isCurrent = i === activeIdx;
        const color = isReopened && i === 1 ? "#C1502E" : done ? "#2F7A4F" : "#E4E0D4";
        return (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center min-w-[70px]">
              <div
                className="rounded-full flex items-center justify-center transition-all"
                style={{
                  width: 22, height: 22,
                  background: done ? color : "#fff",
                  border: `2.5px solid ${color}`,
                  boxShadow: isCurrent ? `0 0 0 4px ${isReopened ? "#FBEAE4" : "#E7F2EA"}` : "none",
                }}
              >
                {done && <CheckCircle2 size={13} color="#fff" strokeWidth={3} />}
              </div>
              <span
                className="text-xs mt-1.5 text-center"
                style={{ fontWeight: isCurrent ? 600 : 500, color: isCurrent ? "#1A1A1A" : "#5B6572" }}
              >
                {isReopened && i === 1 ? "Reopened" : s}
              </span>
            </div>
            {i < STATUSES.length - 1 && (
              <div
                className="flex-1 h-[3px] mb-[18px] rounded"
                style={{ background: i < activeIdx ? "#2F7A4F" : "#E4E0D4" }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
