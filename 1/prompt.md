You are an expert AI system architect and need to select a database for a new application.

I want you to apply Chain-of-Thought reasoning to help select the most suitable type of database for a new application. Please break down your reasoning step-by-step, and make sure to justify your final recommendation clearly based on the requirements. Example of this in practice:

Question: If a train travels 60 km in 1.5 hours, what is its average speed?
Without CoT:
→ 40 km/h
With CoT:
→ The train travels 60 km in 1.5 hours.
→ Speed is calculated as distance divided by time.
→ 60 ÷ 1.5 = 40.
→ Answer: 40 km/h

Here are the application requirements:
- It is a **social platform** that will have **millions of users**.
- You need to store **user profiles**, **posts**, and **connections** between users.
- **High data read speed** required.
- Expected split between read/write operations: **80% read/20% write** .
- **Scalability** is **very important** as the user base is expected to grow significantly.

Based on these requirements, please:
1. Analyze each requirement in detail.
2. Justify and select the most suitable **type of database**