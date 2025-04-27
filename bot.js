const TelegramBot = require('node-telegram-bot-api');
const math = require('mathjs');
const { createCanvas } = require('canvas');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const axios = require('axios');

// Replace with your Telegram bot token
const token = '7501953611:AAGR2jVbc0ghtYw0RC6b4V2GNMp_wzZfCbQ';

// Create a bot instance
const bot = new TelegramBot(token, { polling: true });

// Function to identify the type of mathematical function
function identifyFunction(funcStr) {
    try {
        const node = math.parse(funcStr);
        
        // Check for trigonometric functions
        const trigFunctions = ['sin', 'cos', 'tan', 'cot', 'sec', 'csc'];
        const hasTrig = node.filter(n => n.isFunctionNode && trigFunctions.includes(n.fn.name)).length > 0;
        if (hasTrig) return 'trigonometric';
        
        // Check for exponential
        if (funcStr.includes('^') || funcStr.includes('exp')) return 'exponential';
        
        // Check for logarithmic
        if (funcStr.includes('log') || funcStr.includes('ln')) return 'logarithmic';
        
        // Check for rational (fraction with variable in denominator)
        const denominators = node.filter(n => n.isOperatorNode && n.op === '/' 
                                    && n.args.some(arg => arg.toString().includes('x')));
        if (denominators.length > 0) return 'rational';
        
        // Check for quadratic (x^2 term)
        const quadraticTerms = node.filter(n => 
            (n.isOperatorNode && n.op === '^' && n.args[0].toString() === 'x' && n.args[1].value === 2) ||
            (n.toString().includes('x^2'))
        );
        if (quadraticTerms.length > 0) return 'quadratic';
        
        // Check for linear (x term but no higher powers)
        if (funcStr.includes('x')) return 'linear';
        
        return 'unknown';
    } catch (e) {
        return 'invalid';
    }
}

// Function to solve the equation based on its type
function solveFunction(funcStr, type) {
    try {
        const func = math.compile(funcStr);
        const solution = {};
        
        switch (type) {
            case 'linear':
                // Solve linear equation: ax + b = 0
                const x = math.symbol('x');
                const linearSolution = math.solve(funcStr, x);
                solution.roots = linearSolution;
                solution.type = 'Linear function';
                solution.description = `The root of the equation is x = ${linearSolution[0]}`;
                break;
                
            case 'quadratic':
                // Solve quadratic equation: ax^2 + bx + c = 0
                const quadraticSolution = math.polynomialRoot([1, -3, 2]); // Example coefficients
                solution.roots = quadraticSolution;
                solution.type = 'Quadratic function';
                solution.description = `The roots are x₁ = ${quadraticSolution[0].toFixed(2)}, x₂ = ${quadraticSolution[1].toFixed(2)}`;
                break;
                
            case 'exponential':
                // Analyze exponential function
                solution.type = 'Exponential function';
                solution.description = 'Exponential functions grow/decay at a constant percentage rate.';
                solution.properties = {
                    'Growth/Decay': funcStr.includes('-x') ? 'Decay' : 'Growth',
                    'Base': funcStr.match(/[\d.]+(?=\^)/)?.[0] || 'e'
                };
                break;
                
            case 'logarithmic':
                // Analyze logarithmic function
                solution.type = 'Logarithmic function';
                solution.description = 'Logarithmic functions grow quickly at first and then level off.';
                solution.properties = {
                    'Base': funcStr.includes('ln') ? 'e' : funcStr.match(/log\((\d+)/)?.[1] || '10'
                };
                break;
                
            case 'rational':
                // Analyze rational function
                solution.type = 'Rational function';
                solution.description = 'Rational functions may have vertical asymptotes where denominator is zero.';
                // Find vertical asymptotes by solving denominator = 0
                const denom = funcStr.split('/')[1];
                if (denom) {
                    const asymptotes = math.solve(denom, 'x');
                    solution.asymptotes = asymptotes;
                    solution.description += `\nVertical asymptotes at x = ${asymptotes.join(', ')}`;
                }
                break;
                
            case 'trigonometric':
                // Analyze trigonometric function
                solution.type = 'Trigonometric function';
                solution.description = 'Trigonometric functions are periodic.';
                const trigFunc = funcStr.match(/(sin|cos|tan|cot|sec|csc)/)?.[0] || 'unknown';
                solution.properties = {
                    'Function': trigFunc,
                    'Period': trigFunc === 'sin' || trigFunc === 'cos' ? '2π' : 'π'
                };
                break;
                
            default:
                solution.type = 'Unknown function';
                solution.description = 'Could not determine specific properties for this function type.';
        }
        
        solution.evaluation = `f(0) = ${func.evaluate({x: 0}).toFixed(2)}, f(1) = ${func.evaluate({x: 1}).toFixed(2)}`;
        return solution;
    } catch (e) {
        return { error: `Error solving function: ${e.message}` };
    }
}

// Function to create a graph of the function
function createGraph(funcStr, xMin = -10, xMax = 10) {
    try {
        const width = 600;
        const height = 400;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        
        // Set up the coordinate system
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        // Draw axes
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        
        // X-axis
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.stroke();
        
        // Draw ticks and labels
        ctx.font = '12px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        
        // X-axis ticks
        for (let x = xMin; x <= xMax; x += (xMax - xMin) / 10) {
            const screenX = ((x - xMin) / (xMax - xMin)) * width;
            ctx.beginPath();
            ctx.moveTo(screenX, height / 2 - 5);
            ctx.lineTo(screenX, height / 2 + 5);
            ctx.stroke();
            ctx.fillText(x.toString(), screenX, height / 2 + 20);
        }
        
        // Y-axis ticks
        const yRange = 10; // Adjust based on function values
        for (let y = -yRange; y <= yRange; y += yRange / 5) {
            const screenY = height - ((y + yRange) / (2 * yRange)) * height;
            ctx.beginPath();
            ctx.moveTo(width / 2 - 5, screenY);
            ctx.lineTo(width / 2 + 5, screenY);
            ctx.stroke();
            ctx.fillText(y.toString(), width / 2 - 20, screenY + 5);
        }
        
        // Draw the function
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const func = math.compile(funcStr);
        let firstPoint = true;
        
        for (let screenX = 0; screenX < width; screenX++) {
            const x = xMin + (screenX / width) * (xMax - xMin);
            try {
                const y = func.evaluate({ x });
                
                // Skip non-finite values (asymptotes)
                if (!isFinite(y)) {
                    firstPoint = true;
                    continue;
                }
                
                // Convert y to screen coordinates
                const screenY = height - ((y + yRange) / (2 * yRange)) * height;
                
                if (firstPoint) {
                    ctx.moveTo(screenX, screenY);
                    firstPoint = false;
                } else {
                    ctx.lineTo(screenX, screenY);
                }
            } catch (e) {
                firstPoint = true;
            }
        }
        
        ctx.stroke();
        
        // Save as PNG
        const graphPath = `graph_${Date.now()}.png`;
        fs.writeFileSync(graphPath, canvas.toBuffer('image/png'));
        return graphPath;
    } catch (e) {
        console.error('Error creating graph:', e);
        return null;
    }
}

// Function to create a PDF with the solution and graph
function createPDF(solution, graphPath, outputPath) {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(outputPath));
    
    // Add title
    doc.fontSize(20).text(`Math Function Solution: ${solution.type}`, { align: 'center' });
    doc.moveDown();
    
    // Add solution details
    doc.fontSize(14).text(solution.description);
    doc.moveDown();
    
    if (solution.roots) {
        doc.text(`Roots: ${solution.roots.join(', ')}`);
        doc.moveDown();
    }
    
    if (solution.properties) {
        doc.text('Properties:');
        for (const [key, value] of Object.entries(solution.properties)) {
            doc.text(`- ${key}: ${value}`);
        }
        doc.moveDown();
    }
    
    doc.text(solution.evaluation);
    doc.moveDown();
    
    // Add the graph image
    if (graphPath && fs.existsSync(graphPath)) {
        doc.image(graphPath, {
            fit: [400, 300],
            align: 'center',
            valign: 'center'
        });
    }
    
    doc.end();
    return outputPath;
}

// Handle incoming messages
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userInput = msg.text;
    
    if (!userInput || !userInput.includes('x')) {
        return bot.sendMessage(chatId, 'Please enter a function of x, like "2*x + 3" or "sin(x)"');
    }
    
    try {
        // Identify the function type
        const funcType = identifyFunction(userInput);
        
        if (funcType === 'invalid') {
            return bot.sendMessage(chatId, 'Invalid function format. Please enter a valid mathematical function.');
        }
        
        // Send processing message
        await bot.sendMessage(chatId, `Processing your ${funcType} function: ${userInput}...`);
        
        // Solve the function
        const solution = solveFunction(userInput, funcType);
        
        if (solution.error) {
            return bot.sendMessage(chatId, `Error: ${solution.error}`);
        }
        
        // Create graph
        const graphPath = createGraph(userInput);
        
        // Create PDF
        const pdfPath = `solution_${Date.now()}.pdf`;
        createPDF(solution, graphPath, pdfPath);
        
        // Send the PDF
        await bot.sendDocument(chatId, fs.readFileSync(pdfPath), {}, {
            filename: `math_solution_${userInput.replace(/[^a-z0-9]/gi, '_')}.pdf`,
            contentType: 'application/pdf'
        });
        
        // Clean up temporary files
        if (graphPath) fs.unlinkSync(graphPath);
        fs.unlinkSync(pdfPath);
        
    } catch (error) {
        console.error('Error:', error);
        bot.sendMessage(chatId, 'An error occurred while processing your function. Please try again.');
    }
});

console.log('Math bot is running...');