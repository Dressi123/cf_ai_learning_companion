"use client";

import { useState, useEffect } from "react";
import { FaRegSquareCheck, FaPersonPraying } from "react-icons/fa6";
import { TestCase, ExecutionResult } from "@/types/codingTypes";

interface ConsolePanelProps {
  isSelected: boolean;
  onSelect: () => void;
  testCases?: TestCase[];
  executionResult?: ExecutionResult | null;
  testing?: boolean;
}

export default function ConsolePanel({
  isSelected,
  onSelect,
  testCases = [],
  executionResult = null,
  testing = false,
}: ConsolePanelProps) {
  const [activeTab, setActiveTab] = useState<"testcase" | "result">("testcase");
  const [selectedCase, setSelectedCase] = useState(0);

  // Automatically switch to result tab when execution results are available
  useEffect(() => {
    if (executionResult) {
      setActiveTab("result");
    }
  }, [executionResult]);

  // Filter out hidden test cases for display
  const visibleTestCases = testCases.filter(tc => !tc.hidden);

  return (
    <div
      onClick={onSelect}
      className={`bg-[#262626] rounded flex flex-col h-full ${
        isSelected ? "border border-[#606060]" : "border border-transparent"
      }`}
    >
      <div className="flex items-center px-1 py-1 bg-[#333333]">
        <span
          onClick={() => setActiveTab("testcase")}
          className={`text-sm font-bold flex items-center py-1 px-2 rounded hover:bg-[#434343] cursor-pointer ${
            activeTab === "testcase" ? "text-gray-300" : "text-gray-500"
          }`}
        >
          <FaRegSquareCheck className="text-blue-500 mr-1" /> Testcase
        </span>
        <span className="w-[1px] bg-[#606060] h-3" />
        <span
          onClick={() => setActiveTab("result")}
          className={`text-gray-300 text-sm font-bold flex items-center py-1 px-2 rounded hover:bg-[#434343] cursor-pointer ${
            activeTab === "result" ? "text-gray-300" : "text-gray-500"
          }`}
        >
          <FaPersonPraying className="text-blue-500 mr-1" /> Test Result
        </span>
      </div>

      {activeTab === "testcase" && visibleTestCases.length > 0 ? (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Case tabs */}
          <div className="flex items-center gap-1 px-2 py-2 border-b border-[#333333]">
            {visibleTestCases.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedCase(index)}
                className={`px-3 py-1 text-sm rounded cursor-pointer ${
                  selectedCase === index
                    ? "bg-[#434343] text-white font-semibold"
                    : "text-gray-400 hover:bg-[#333333]"
                }`}
              >
                Case {index + 1}
              </button>
            ))}
          </div>

          {/* Test case content */}
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-3">
              <div>
                <div className="text-gray-400 text-xs font-semibold mb-1">Input</div>
                <div className="bg-[#1e1e1e] p-2 rounded text-green-400 font-mono text-sm">
                  {visibleTestCases[selectedCase]?.input}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs font-semibold mb-1">Expected Output</div>
                <div className="bg-[#1e1e1e] p-2 rounded text-blue-400 font-mono text-sm">
                  {visibleTestCases[selectedCase]?.expectedOutput}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "result" ? (
        <div className="p-4 font-mono text-sm flex-1 overflow-auto">
          {testing ? (
            <div className="text-indigo-600">$ Running tests...</div>
          ) : executionResult ? (
            <div className="space-y-4">
              {/* Summary */}
              <div className="pb-2 border-b border-[#333333]">
                <div className={`text-lg font-bold ${executionResult.success ? "text-green-500" : "text-red-500"}`}>
                  {executionResult.success ? "✓ All Tests Passed!" : "✗ Some Tests Failed"}
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  Passed: {executionResult.passedTests}/{executionResult.totalTests} |
                  Execution Time: {executionResult.executionTime}ms
                </div>
              </div>

              {/* Error message if any */}
              {executionResult.error && (
                <div className="bg-red-900/20 border border-red-500/50 rounded p-3">
                  <div className="text-red-400 font-semibold mb-1">Error:</div>
                  <div className="text-red-300 text-xs whitespace-pre-wrap">{executionResult.error}</div>
                </div>
              )}

              {/* Test results */}
              {executionResult.results && executionResult.results.map((result, index) => (
                <div
                  key={result.testId}
                  className={`border rounded p-3 ${
                    result.passed
                      ? "border-green-500/50 bg-green-900/10"
                      : "border-red-500/50 bg-red-900/10"
                  }`}
                >
                  <div className={`font-semibold mb-2 ${result.passed ? "text-green-400" : "text-red-400"}`}>
                    {result.passed ? "✓" : "✗"} Test Case {index + 1}
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="text-gray-400 font-semibold">Input:</div>
                      <div className="bg-[#1e1e1e] p-2 rounded text-green-400 mt-1">
                        {result.input}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-400 font-semibold">Expected Output:</div>
                      <div className="bg-[#1e1e1e] p-2 rounded text-blue-400 mt-1">
                        {result.expectedOutput}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-400 font-semibold">Your Output:</div>
                      <div className={`bg-[#1e1e1e] p-2 rounded mt-1 ${
                        result.passed ? "text-green-400" : "text-red-400"
                      }`}>
                        {result.actualOutput || "No output"}
                      </div>
                    </div>

                    {result.error && (
                      <div>
                        <div className="text-gray-400 font-semibold">Error:</div>
                        <div className="bg-[#1e1e1e] p-2 rounded text-red-400 mt-1">
                          {result.error}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-indigo-600">$ Ready to run your code...</div>
          )}
        </div>
      ) : (
        <div className="p-4 font-mono text-sm text-gray-400 flex-1 overflow-auto">
          <div>No test cases available</div>
        </div>
      )}
    </div>
  );
}
