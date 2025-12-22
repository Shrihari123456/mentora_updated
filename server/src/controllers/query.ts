import { Request, Response } from 'express';
import Student from '../models/student';

function determineVisualization(pipeline: any[]): {
  type: 'table' | 'bar' | 'pie' | 'line' | 'scatter';
  xField?: string;
  yField?: string;
  sizeField?: string;
  colorField?: string;
  explanation: string;
} {
  // Default explanation
  let explanation = "Displaying raw data in table format";
  
  // Check if there's a $group stage
  const groupStage = pipeline.find(stage => '$group' in stage);
  const sortStage = pipeline.find(stage => '$sort' in stage);
  const matchStage = pipeline.find(stage => '$match' in stage);
  const limitStage = pipeline.find(stage => '$limit' in stage);

  if (groupStage) {
    const groupKeys = Object.keys(groupStage.$group);
    const nonIdKeys = groupKeys.filter(k => k !== '_id');
    const idField = groupStage.$group._id;
    
    // Determine what we're grouping by
    let groupByField = typeof idField === 'string' ? idField.replace('$', '') : 'category';
    
    // If there are aggregation fields
    if (nonIdKeys.length > 0) {
      const aggField = nonIdKeys[0];
      const aggType = groupStage.$group[aggField]?.$sum ? 'count' : 
                     groupStage.$group[aggField]?.$avg ? 'average' :
                     groupStage.$group[aggField]?.$max ? 'maximum' :
                     groupStage.$group[aggField]?.$min ? 'minimum' : 'value';
      
      const aggFieldName = aggField.replace(/^\$/, '').replace(/([A-Z])/g, ' $1').toLowerCase();
      
      explanation = `Showing ${aggType} of ${aggFieldName} grouped by ${groupByField}`;
      
      // For averages or sums, use bar chart
      if (aggType === 'average' || aggType === 'sum' || aggType === 'count') {
        return {
          type: 'bar',
          xField: '_id',
          yField: nonIdKeys[0],
          explanation
        };
      }
      // For min/max, use line chart
      else if (aggType === 'maximum' || aggType === 'minimum') {
        return {
          type: 'line',
          xField: '_id',
          yField: nonIdKeys[0],
          explanation
        };
      }
    }
    
    // If it's just counting documents
    explanation = `Counting students grouped by ${groupByField}`;
    return {
      type: 'pie',
      xField: '_id',
      yField: 'count',
      explanation
    };
  }
  
  // Check for sorting
  if (sortStage) {
    const sortField = Object.keys(sortStage.$sort)[0];
    const sortDirection = sortStage.$sort[sortField] === 1 ? 'ascending' : 'descending';
    
    explanation = `Students sorted by ${sortField} in ${sortDirection} order`;
    
    if (limitStage) {
      explanation += ` (top ${limitStage.$limit} results)`;
      return {
        type: 'bar',
        xField: 'name',
        yField: sortField,
        explanation
      };
    }
    
    return {
      type: 'table',
      explanation
    };
  }
  
  // Check for filtering
  if (matchStage) {
    const matchFields = Object.keys(matchStage.$match);
    explanation = `Students filtered by ${matchFields.join(', ')}`;
    
    if (matchFields.includes('height') || matchFields.includes('weight') || matchFields.includes('marks')) {
      return {
        type: 'scatter',
        xField: 'name',
        yField: matchFields.find(f => ['height', 'weight', 'marks'].includes(f)) || 'marks',
        sizeField: 'marks',
        colorField: 'section',
        explanation
      };
    }
  }
  
  // Default to table
  return {
    type: 'table',
    explanation
  };
}

export const processTextQuery = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        success: false,
        error: 'Query is required' 
      });
    }

    const apiKey = 'AIzaSyD0vwOZryNbKp2uraCPOfGPohmsqXdjBm8';
    
    const prompt = `You are a MongoDB query expert. Convert natural language to MongoDB aggregation pipeline JSON and provide a detailed explanation.

Student Schema:
- name: String
- email: String  
- dob: Date
- height: Number
- weight: Number
- bloodGroup: String
- admissionYear: Number
- section: String
- marks: Number
- semesters: Array
- father: String
- mother: String
- siblings: Array
- achievements: Array
- appointments: Array

Rules:
1. Return a JSON object with two fields: "pipeline" (array of stages) and "explanation" (string)
2. Use $match for filtering, $group for aggregation, $sort for ordering, $limit for limiting
3. Use proper MongoDB operators: $gt, $lt, $gte, $lte, $eq, $ne, $in
4. For grouping use _id field and aggregation operators like $sum, $avg, $min, $max
5. The explanation should describe what the query does in natural language

Examples:
Input: "Students in section A" 
Output: {
  "pipeline": [{"$match":{"section":"A"}}],
  "explanation": "Filters students who belong to section A"
}

Input: "Count students by blood group" 
Output: {
  "pipeline": [{"$group":{"_id":"$bloodGroup","count":{"$sum":1}}}],
  "explanation": "Groups students by their blood group and counts how many students are in each group"
}

Input: "Top 5 students by height" 
Output: {
  "pipeline": [{"$sort":{"height":-1}},{"$limit":5}],
  "explanation": "Sorts students by height in descending order and returns the top 5 tallest students"
}

Input: "Average marks by section" 
Output: {
  "pipeline": [{"$group":{"_id":"$section","avgMarks":{"$avg":"$marks"}}}],
  "explanation": "Calculates the average marks for students in each section"
}

Query: "${query}"

JSON Response:`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Full API Response:', JSON.stringify(data, null, 2));
    
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      console.error('No text response found. Full response:', data);
      throw new Error(`No response from API. Response: ${JSON.stringify(data)}`);
    }
    
    // Extract JSON from response
    const jsonStart = textResponse.indexOf('{');
    const jsonEnd = textResponse.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('Invalid response format');
    }
    
    const jsonString = textResponse.slice(jsonStart, jsonEnd);
    const responseData = JSON.parse(jsonString);
    
    if (!responseData.pipeline || !Array.isArray(responseData.pipeline)) {
      throw new Error('Invalid pipeline in response');
    }

    const pipeline = responseData.pipeline;
    const apiExplanation = responseData.explanation || "No explanation provided";

    // Execute the query
    const results = await Student.aggregate(pipeline);

    // Determine visualization type and enhance explanation
    const visualization = determineVisualization(pipeline);
    const fullExplanation = `${apiExplanation}. ${visualization.explanation}`;

    res.json({
      success: true,
      data: results,
      pipeline: pipeline,
      visualization: {
        type: visualization.type,
        xField: visualization.xField,
        yField: visualization.yField,
        sizeField: visualization.sizeField,
        colorField: visualization.colorField
      },
      explanation: fullExplanation,
      chartTitle: `Visualization: ${query}`,
      chartOptions: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `Visualization: ${query}`,
            font: { size: 16 }
          },
          subtitle: {
            display: true,
            text: fullExplanation,
            font: { size: 12 }
          }
        }
      }
    });

  } catch (error: any) {
    console.error('Query processing error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.message
    });
  }
};