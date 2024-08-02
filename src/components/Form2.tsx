"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "@/utils/axios";
import { useEffect, useState } from "react";
import { MultiSelect } from "react-multi-select-component";

// Define the schema using Zod
const schema = z.object({
  data: z.string().min(1, "Data cannot be empty"),
});

type FormData = z.infer<typeof schema>;

const Form: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const [response, setResponse] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);

  const onSubmit: SubmitHandler<FormData> = async (formData) => {
    try {
      // Validate and parse the JSON
      let parsedData;
      try {
        parsedData = JSON.parse(formData.data);
      } catch (error) {
        throw new Error("Invalid JSON format");
      }

      if (!Array.isArray(parsedData.data)) {
        throw new Error('Invalid JSON format: "data" should be an array');
      }

      const { data } = await axios.post("/api/bfhl", parsedData);
      setResponse(data);
      setErrorMessage(null);
      setSelectedOptions([]); // Reset selected options
    } catch (error: any) {
      console.error("Error:", error);
      setErrorMessage(error.message || "An unexpected error occurred");
      setResponse(null);
    }
  };

  const options = [
    { label: "Alphabets", value: "Alphabets" },
    { label: "Numbers", value: "Numbers" },
    { label: "Highest Alphabet", value: "Highest Alphabet" },
  ];

  const handleMultiSelectChange = (selectedItems: any[]) => {
    setSelectedOptions(selectedItems);
  };

  const renderFilteredResponse = () => {
    if (!response) return null;

    const { numbers, alphabets, highest_alphabet } = response;
    let filteredData: any = {};

    const selectedValues = selectedOptions.map((option) => option.value);

    if (selectedValues.includes("Numbers")) {
      filteredData.numbers = numbers;
    }
    if (selectedValues.includes("Alphabets")) {
      filteredData.alphabets = alphabets;
    }
    if (selectedValues.includes("Highest Alphabet")) {
      filteredData.highest_alphabet = highest_alphabet;
    }

    return <pre>{JSON.stringify(filteredData, null, 2)}</pre>;
  };

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const { data } = await axios.get("/api/bfhl");
        console.log(data)
      } catch (error: any) {
        console.error("Error:", error);
        setErrorMessage(error.message || "An unexpected error occurred");
        setResponse(null);
      }
    };
    fetchMe();
  }, []);

  return (
    <div className="max-w-lg w-full p-4">
      <h1 className="text-2xl font-bold mb-4">Submit Data</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="data"
            className="block text-sm font-medium text-gray-700"
          >
            JSON Data
          </label>

          <textarea
            id="data"
            {...register("data")}
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder='{"data": ["A","C","z"]}'
          />
          {errors.data && (
            <p className="text-red-500 text-sm">{errors.data.message}</p>
          )}
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Submit
        </button>
        {errorMessage && (
          <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
        )}
      </form>

      {response && (
        <div className="mt-4">
          <label
            htmlFor="filter"
            className="block text-sm font-medium text-gray-700"
          >
            Filter Response
          </label>
          <MultiSelect
            options={options}
            value={selectedOptions}
            onChange={handleMultiSelectChange}
            labelledBy="Select"
            className="mt-1"
          />
          <div className="mt-4">
            <h2 className="text-xl font-bold mb-2">Filtered Response:</h2>
            {renderFilteredResponse()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Form;
