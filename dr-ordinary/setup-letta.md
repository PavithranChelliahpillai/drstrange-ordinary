# 🧬 Letta Agent Setup for Dr. Ordinary

This guide will help you set up a Letta agent to work with the Dr. Ordinary Chrome extension for intelligent drug detection.

## Prerequisites

1. **Install Letta** (choose one method):

### Option A: Docker (Recommended)
```bash
docker run -d \
  --name letta \
  -p 8283:8283 \
  -e OPENAI_API_KEY=your_openai_api_key \
  letta/letta:latest
```

### Option B: pip
```bash
pip install -U letta
export OPENAI_API_KEY=your_openai_api_key
letta server
```

## Step 1: Create the Drug Detection Agent

### Using Letta CLI
```bash
# If using Docker
docker exec -it letta letta run

# If using pip
letta run
```

### Agent Configuration
When prompted, use these settings:

```
🧬 Creating new agent...
? Select LLM model: gpt-4 (or your preferred model)
? Select embedding model: text-embedding-ada-002 (or your preferred model)
-> 🤖 Using persona profile: 'custom'
-> 🧑 Using human profile: 'basic'
-> 🛠️ Tools: (default tools are fine)
```

### Custom Persona for Drug Detection
Create a custom persona with this prompt:

```
You are a pharmaceutical expert and drug interaction specialist. Your role is to:

1. Analyze web content for drug-related information
2. Identify drug names (generic and brand names)
3. Detect potential drug interactions
4. Assess medical risks and warnings
5. Provide clinical recommendations

You have expertise in:
- Pharmacology and drug mechanisms
- Drug-drug interactions
- Drug-food interactions
- Medical terminology
- Clinical safety assessment

When analyzing content:
- Be thorough but concise
- Focus on actionable medical information
- Provide severity assessments (high/medium/low)
- Include specific drug names and interactions
- Recommend further analysis when appropriate

Always prioritize patient safety and recommend consulting healthcare professionals for medical decisions.
```

## Step 2: Configure the Extension

### Update Agent ID
In `dr-ordinary/background/service-worker.js`, update the `LETTA_AGENT_ID`:

```javascript
const LETTA_AGENT_ID = 'your-agent-name'; // Replace with your actual agent name
```

### Test the Connection
1. Start your Letta server
2. Load the Chrome extension
3. Visit a page with drug content
4. Check the browser console for connection status

## Step 3: Test the Integration

### Test Page
Visit a page like: `https://www.webmd.com/drugs/2/drug-1611/ibuprofen-oral/details`

### Expected Behavior
1. Extension sends page snippet to Letta agent
2. Agent responds with "YES" if drugs detected
3. Extension sends full content for detailed analysis
4. Agent returns structured drug information
5. Extension highlights drugs and shows warnings

## Step 4: Customize the Agent

### Fine-tune the Prompts
You can customize the prompts in `background/service-worker.js`:

#### Snippet Analysis Prompt
```javascript
message: `Analyze this webpage snippet and determine if it contains any drug-related content. 
        
URL: ${url}
Snippet: ${snippet}

Respond with only "YES" if drugs are mentioned or if this is a medical/pharmaceutical page, or "NO" if no drugs are detected.`
```

#### Full Analysis Prompt
```javascript
message: `Perform a comprehensive analysis of this webpage content to identify drug-related information.
        
URL: ${url}
Content: ${content.substring(0, 8000)}

Please identify:
1. All drug names mentioned (generic and brand names)
2. Any drug interactions mentioned
3. Medical conditions discussed
4. Severity of any drug warnings
5. Recommendations for further analysis

Format your response as JSON with the following structure:
{
  "drugs": ["drug1", "drug2"],
  "interactions": [{"drug1": "drug1", "drug2": "drug2", "severity": "high/medium/low"}],
  "conditions": ["condition1", "condition2"],
  "warnings": ["warning1", "warning2"],
  "recommendations": ["recommendation1", "recommendation2"]
}`
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure Letta server is running on port 8283
   - Check firewall settings
   - Verify Docker container is running

2. **Agent Not Found**
   - Verify agent name in `LETTA_AGENT_ID`
   - Check agent exists in Letta CLI: `letta run`

3. **API Errors**
   - Check OpenAI API key is valid
   - Verify API quota and limits
   - Check Letta server logs

4. **Performance Issues**
   - Reduce content size limit (currently 8000 chars)
   - Add more specific content filtering
   - Implement caching for repeated analyses

### Debug Mode
Enable debug logging in the extension:

```javascript
// In background/service-worker.js
console.log('Letta API Response:', data);
console.log('Analysis Result:', result);
```

## Advanced Configuration

### Multiple Agents
You can create specialized agents for different types of analysis:

- `drug-detector-agent`: General drug detection
- `interaction-specialist-agent`: Focus on drug interactions
- `medical-warning-agent`: Medical risk assessment

### Custom Tools
Add custom tools to your Letta agent for enhanced functionality:

- Drug database lookup
- Interaction severity calculator
- Medical literature search
- Patient profile matching

### Performance Optimization
- Implement response caching
- Use streaming for large content
- Add content preprocessing
- Implement rate limiting

## Security Considerations

- Never log sensitive medical data
- Implement proper error handling
- Use HTTPS for production
- Add input validation
- Consider data retention policies

## Next Steps

1. **Test with various websites** (medical, pharmaceutical, news)
2. **Fine-tune the agent prompts** based on results
3. **Add more drug databases** for comprehensive coverage
4. **Implement user feedback** for continuous improvement
5. **Add integration with Dr. Strange** for detailed analysis

## Support

- Letta Documentation: https://docs.letta.com/
- Letta GitHub: https://github.com/letta-ai/letta
- Community Discord: Join Letta's Discord for support 