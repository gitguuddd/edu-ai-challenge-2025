import OpenAI from "openai";
import products from "./products.json" assert { type: "json" };

const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const extractFilterParams = async (naturalQuery) => {
    const tools = [{
        "type": "function",
        "function": {
            "name": "filter_items",
            "description": "Filter and return products that match the user's search criteria",
            "parameters": {
                "type": "object",
                "properties": {
                    "matching_products": {
                        "type": "array",
                        "description": "Products that exactly match all the user's criteria",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name": {"type": "string"},
                                "category": {"type": "string"},
                                "price": {"type": "number"},
                                "rating": {"type": "number"},
                                "in_stock": {"type": "boolean"}
                            },
                            "required": ["name", "category", "price", "rating", "in_stock"],
                            "additionalProperties": false
                        }
                    }
                },
                "required": ["matching_products"]
            }
        }
    }];

    const messages = [
        {
            "role": "system",
            "content": `Filter products based on user queries. Here's the complete dataset:

${JSON.stringify(products, null, 2)}

Rules:
1. "under $X" means price < X
2. "over $X" means price > X  
3. "between $X and $Y" means X <= price <= Y
4. "in stock" means in_stock = true
5. Categories: electronics, kitchen, fitness, books, clothing
6. Return ONLY products that match ALL criteria
7. Copy the exact product data - don't modify any values`
        },
        {
            "role": "user",
            "content": naturalQuery
        }
    ];

    const response = await openaiClient.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: messages,
        tools: tools,
        tool_choice: {"type": "function", "function": {"name": "filter_items"}}
    });

    const toolCall = response.choices[0]?.message?.tool_calls?.[0];
    
    if (toolCall && toolCall.function.name === "filter_items") {
        const result = JSON.parse(toolCall.function.arguments);
        
        return {
            results: result.matching_products,
            count: result.matching_products.length
        };
    }
    
    throw new Error("We couldn't filter the items based on your request. Please try again.");
};

