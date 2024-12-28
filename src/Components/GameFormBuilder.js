import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const GameFormBuilder = () => {
  const [formName, setFormName] = useState("");
  const [questions, setQuestions] = useState([]);
  const { formId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const getFormData = () => {
      if (formId) {
        const mockFormData = {
          name: "Sample Form",
          questions: [
            {
              label: "Select the winner",
              field_type: "select_winner",
              choices: [
                { choice_text: "Team A", points: 5 },
                { choice_text: "Team B", points: 5 },
              ],
            },
            {
              label: "Over/Under",
              field_type: "over_under",
            },
            {
              label: "Custom Radio",
              field_type: "custom_radio",
              choices: [
                { choice_text: "Option 1", points: 2 },
                { choice_text: "Option 2", points: 3 },
              ],
            },
            {
              label: "Custom Select",
              field_type: "custom_select",
              choices: [
                { choice_text: "Option A", points: 1 },
                { choice_text: "Option B", points: 2 },
              ],
            },
          ],
        };

        setFormName(mockFormData.name);
        setQuestions(mockFormData.questions);
      }
    };

    getFormData();
  }, [formId]);

  const handleQuestionChange = (e, questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex][e.target.name] = e.target.value;
    setQuestions(updatedQuestions);
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      label: "",
      field_type: "select_winner", // Default type for new question
      choices: [
        { choice_text: "", points: 0 },
        { choice_text: "", points: 0 },
      ],
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleDeleteQuestion = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(questionIndex, 1);
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (e, questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].choices[optionIndex] = {
      choice_text: e.target.value,
      points: updatedQuestions[questionIndex].choices[optionIndex].points,
    };
    setQuestions(updatedQuestions);
  };

  const handleOptionPointsChange = (e, questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].choices[optionIndex] = {
      choice_text: updatedQuestions[questionIndex].choices[optionIndex].choice_text,
      points: parseFloat(e.target.value), // Allows for decimal points
    };
    setQuestions(updatedQuestions);
  };

  const handleAddOption = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].choices.push({ choice_text: "", points: 0 });
    setQuestions(updatedQuestions);
  };

  const handleDeleteOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].choices.splice(optionIndex, 1);
    setQuestions(updatedQuestions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      name: formName,
      questions: questions,
    };
    console.log(data);

    if (formId) {
      console.log("Form Updated Successfully");
      navigate("/");
    } else {
      console.log("Form Created Successfully");
      setFormName("");
      setQuestions([]);
      navigate("/");
    }
  };

  return (
    <div className="container mx-auto my-8 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {formId ? "Edit Form" : "Create Form"}
        </h1>
        <Link to="/" className="text-sm text-blue-500 hover:underline">
          Back to Forms
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="formName" className="block text-sm font-medium text-gray-700">
            Form Name
          </label>
          <input
            type="text"
            name="formName"
            id="formName"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter form name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
        </div>

        <hr className="my-6 border-gray-300" />

        <ul className="space-y-4">
          {questions.map((question, questionIndex) => (
            <li key={questionIndex} className="p-4 border border-gray-200 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <input
                  type="text"
                  name="label"
                  placeholder="Question Label"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                  value={question.label}
                  onChange={(e) => handleQuestionChange(e, questionIndex)}
                />
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm"
                  type="button"
                  onClick={() => handleDeleteQuestion(questionIndex)}
                >
                  Delete Question
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-700">Field Type</label>
                <select
                  name="field_type"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  defaultValue={question.field_type}
                  onChange={(e) => handleQuestionChange(e, questionIndex)}
                >
                  <option value="">Select Field Type</option>
                  <option value="select_winner">Select Winner</option>
                  <option value="over_under">Over/Under</option>
                  <option value="custom_radio">Custom Radio</option>
                  <option value="custom_select">Custom Select</option>
                </select>
              </div>

              {question.field_type === "select_winner" && (
                <div>
                  <h4 className="font-medium text-gray-700">Options</h4>
                  <ul className="space-y-2">
                    {question.choices.map((option, optionIndex) => (
                      <li key={optionIndex} className="flex items-center space-x-2">
                        <input
                          type="text"
                          name="option"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md"
                          value={option.choice_text}
                          onChange={(e) => handleOptionChange(e, questionIndex, optionIndex)}
                        />
                        <input
                          type="number"
                          name="points"
                          value={option.points}
                          onChange={(e) => handleOptionPointsChange(e, questionIndex, optionIndex)}
                          className="w-24 px-4 py-2 border border-gray-300 rounded-md"
                          min="0"
                          step="0.5" // Allows half-point values
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {question.field_type === "custom_radio" && (
                <div>
                  <h4 className="font-medium text-gray-700">Options</h4>
                  <ul className="space-y-2">
                    {question.choices.map((option, optionIndex) => (
                      <li key={optionIndex} className="flex items-center space-x-2">
                        <input
                          type="text"
                          name="option"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md"
                          value={option.choice_text}
                          onChange={(e) => handleOptionChange(e, questionIndex, optionIndex)}
                        />
                        <input
                          type="number"
                          name="points"
                          value={option.points}
                          onChange={(e) => handleOptionPointsChange(e, questionIndex, optionIndex)}
                          className="w-24 px-4 py-2 border border-gray-300 rounded-md"
                          min="0"
                          step="0.1" // Allows half-point values
                        />
                        <button
                          type="button"
                          className="bg-red-500 text-white px-2 py-1 rounded-md text-sm"
                          onClick={() => handleDeleteOption(questionIndex, optionIndex)}
                        >
                          Remove Option
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md mt-3"
                    onClick={() => handleAddOption(questionIndex)}
                  >
                    Add Option
                  </button>
                </div>
              )}

              {question.field_type === "custom_select" && (
                <div>
                  <h4 className="font-medium text-gray-700">Options</h4>
                  <ul className="space-y-2">
                    {question.choices.map((option, optionIndex) => (
                      <li key={optionIndex} className="flex items-center space-x-2">
                        <input
                          type="text"
                          name="option"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md"
                          value={option.choice_text}
                          onChange={(e) => handleOptionChange(e, questionIndex, optionIndex)}
                        />
                        <input
                          type="number"
                          name="points"
                          value={option.points}
                          onChange={(e) => handleOptionPointsChange(e, questionIndex, optionIndex)}
                          className="w-24 px-4 py-2 border border-gray-300 rounded-md"
                          min="0"
                          step="0.1" // Allows half-point values
                        />
                        <button
                          type="button"
                          className="bg-red-500 text-white px-2 py-1 rounded-md text-sm"
                          onClick={() => handleDeleteOption(questionIndex, optionIndex)}
                        >
                          Remove Option
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md mt-3"
                    onClick={() => handleAddOption(questionIndex)}
                  >
                    Add Option
                  </button>
                </div>
              )}

              {question.field_type === "over_under"}
            </li>
          ))}
        </ul>

        <div className="flex justify-between items-center mt-8">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            type="button"
            onClick={handleAddQuestion}
          >
            Add Question
          </button>
          <button
            className="bg-green-500 text-white px-6 py-3 rounded-lg text-lg"
            type="submit"
          >
            {formId ? "Update Form" : "Create Form"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GameFormBuilder;
