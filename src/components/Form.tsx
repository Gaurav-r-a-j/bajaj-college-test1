"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "@/utils/axios";
import { useState } from "react";

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
  const [filter, setFilter] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    } catch (error: any) {
      console.error("Error:", error);
      setErrorMessage(error.message || "An unexpected error occurred");
      setResponse(null);
    }
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Array.from(
      event.target.selectedOptions,
      (option) => option.value
    );
    setFilter(value);
  };

  const renderFilteredResponse = () => {
    if (!response) return null;

    const { numbers, alphabets, highest_alphabet } = response;
    let filteredData: any = {};

    if (filter.includes("Numbers")) {
      filteredData.numbers = numbers;
    }
    if (filter.includes("Alphabets")) {
      filteredData.alphabets = alphabets;
    }
    if (filter.includes("Highest Alphabet")) {
      filteredData.highest_alphabet = highest_alphabet;
    }

    return <pre>{JSON.stringify(filteredData, null, 2)}</pre>;
  };

  return (
    <div className="max-w-lg mx-auto p-4">
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
            className="mt-1 p-2 border border-gray-300 rounded-md shadow-sm w-full h-32"
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
          <select
            id="filter"
            multiple
            onChange={handleFilterChange}
            className="mt-1 p-2 border border-gray-300 rounded-md shadow-sm w-full"
          >
            <option value="Alphabets">Alphabets</option>
            <option value="Numbers">Numbers</option>
            <option value="Highest Alphabet">Highest Alphabet</option>
          </select>
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
