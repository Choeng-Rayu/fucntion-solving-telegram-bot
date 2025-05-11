// const TelegramBot = require('node-telegram-bot-api');
// const math = require('mathjs');
// const { createCanvas } = require('canvas');
// const fs = require('fs');
// const PDFDocument = require('pdfkit');
// const axios = require('axios');

// // Replace with your Telegram bot token
// const token = '7501953611:AAGR2jVbc0ghtYw0RC6b4V2GNMp_wzZfCbQ';

// // Create a bot instance
// const bot = new TelegramBot(token, { polling: true });

// // Function to identify the type of mathematical function
// function identifyFunction(funcStr) {
//     try {
//         const node = math.parse(funcStr);
        
//         // Check for trigonometric functions
//         const trigFunctions = ['sin', 'cos', 'tan', 'cot', 'sec', 'csc'];
//         const hasTrig = node.filter(n => n.isFunctionNode && trigFunctions.includes(n.fn.name)).length > 0;
//         if (hasTrig) return 'trigonometric';
        
//         // Check for exponential
//         if (funcStr.includes('^') || funcStr.includes('exp')) return 'exponential';
        
//         // Check for logarithmic
//         if (funcStr.includes('log') || funcStr.includes('ln')) return 'logarithmic';
        
//         // Check for rational (fraction with variable in denominator)
//         const denominators = node.filter(n => n.isOperatorNode && n.op === '/' 
//                                     && n.args.some(arg => arg.toString().includes('x')));
//         if (denominators.length > 0) return 'rational';
        
//         // Check for quadratic (x^2 term)
//         const quadraticTerms = node.filter(n => 
//             (n.isOperatorNode && n.op === '^' && n.args[0].toString() === 'x' && n.args[1].value === 2) ||
//             (n.toString().includes('x^2'))
//         );
//         if (quadraticTerms.length > 0) return 'quadratic';
        
//         // Check for linear (x term but no higher powers)
//         if (funcStr.includes('x')) return 'linear';
        
//         return 'unknown';
//     } catch (e) {
//         return 'invalid';
//     }
// }

// // Function to solve the equation based on its type
// function solveFunction(funcStr, type) {
//     try {
//         const func = math.compile(funcStr);
//         const solution = {};
        
//         switch (type) {
//             case 'linear':
//                 // Solve linear equation: ax + b = 0
//                 const x = math.symbol('x');
//                 const linearSolution = math.solve(funcStr, x);
//                 solution.roots = linearSolution;
//                 solution.type = 'Linear function';
//                 solution.description = `The root of the equation is x = ${linearSolution[0]}`;
//                 break;
                
//             case 'quadratic':
//                 // Solve quadratic equation: ax^2 + bx + c = 0
//                 const quadraticSolution = math.polynomialRoot([1, -3, 2]); // Example coefficients
//                 solution.roots = quadraticSolution;
//                 solution.type = 'Quadratic function';
//                 solution.description = `The roots are x₁ = ${quadraticSolution[0].toFixed(2)}, x₂ = ${quadraticSolution[1].toFixed(2)}`;
//                 break;
                
//             case 'exponential':
//                 // Analyze exponential function
//                 solution.type = 'Exponential function';
//                 solution.description = 'Exponential functions grow/decay at a constant percentage rate.';
//                 solution.properties = {
//                     'Growth/Decay': funcStr.includes('-x') ? 'Decay' : 'Growth',
//                     'Base': funcStr.match(/[\d.]+(?=\^)/)?.[0] || 'e'
//                 };
//                 break;
                
//             case 'logarithmic':
//                 // Analyze logarithmic function
//                 solution.type = 'Logarithmic function';
//                 solution.description = 'Logarithmic functions grow quickly at first and then level off.';
//                 solution.properties = {
//                     'Base': funcStr.includes('ln') ? 'e' : funcStr.match(/log\((\d+)/)?.[1] || '10'
//                 };
//                 break;
                
//             case 'rational':
//                 // Analyze rational function
//                 solution.type = 'Rational function';
//                 solution.description = 'Rational functions may have vertical asymptotes where denominator is zero.';
//                 // Find vertical asymptotes by solving denominator = 0
//                 const denom = funcStr.split('/')[1];
//                 if (denom) {
//                     const asymptotes = math.solve(denom, 'x');
//                     solution.asymptotes = asymptotes;
//                     solution.description += `\nVertical asymptotes at x = ${asymptotes.join(', ')}`;
//                 }
//                 break;
                
//             case 'trigonometric':
//                 // Analyze trigonometric function
//                 solution.type = 'Trigonometric function';
//                 solution.description = 'Trigonometric functions are periodic.';
//                 const trigFunc = funcStr.match(/(sin|cos|tan|cot|sec|csc)/)?.[0] || 'unknown';
//                 solution.properties = {
//                     'Function': trigFunc,
//                     'Period': trigFunc === 'sin' || trigFunc === 'cos' ? '2π' : 'π'
//                 };
//                 break;
                
//             default:
//                 solution.type = 'Unknown function';
//                 solution.description = 'Could not determine specific properties for this function type.';
//         }
        
//         solution.evaluation = `f(0) = ${func.evaluate({x: 0}).toFixed(2)}, f(1) = ${func.evaluate({x: 1}).toFixed(2)}`;
//         return solution;
//     } catch (e) {
//         return { error: `Error solving function: ${e.message}` };
//     }
// }

// // Function to create a graph of the function
// function createGraph(funcStr, xMin = -10, xMax = 10) {
//     try {
//         const width = 600;
//         const height = 400;
//         const canvas = createCanvas(width, height);
//         const ctx = canvas.getContext('2d');
        
//         // Set up the coordinate system
//         ctx.fillStyle = 'white';
//         ctx.fillRect(0, 0, width, height);
        
//         // Draw axes
//         ctx.strokeStyle = 'black';
//         ctx.lineWidth = 1;
        
//         // X-axis
//         ctx.beginPath();
//         ctx.moveTo(0, height / 2);
//         ctx.lineTo(width, height / 2);
//         ctx.stroke();
        
//         // Y-axis
//         ctx.beginPath();
//         ctx.moveTo(width / 2, 0);
//         ctx.lineTo(width / 2, height);
//         ctx.stroke();
        
//         // Draw ticks and labels
//         ctx.font = '12px Arial';
//         ctx.fillStyle = 'black';
//         ctx.textAlign = 'center';
        
//         // X-axis ticks
//         for (let x = xMin; x <= xMax; x += (xMax - xMin) / 10) {
//             const screenX = ((x - xMin) / (xMax - xMin)) * width;
//             ctx.beginPath();
//             ctx.moveTo(screenX, height / 2 - 5);
//             ctx.lineTo(screenX, height / 2 + 5);
//             ctx.stroke();
//             ctx.fillText(x.toString(), screenX, height / 2 + 20);
//         }
        
//         // Y-axis ticks
//         const yRange = 10; // Adjust based on function values
//         for (let y = -yRange; y <= yRange; y += yRange / 5) {
//             const screenY = height - ((y + yRange) / (2 * yRange)) * height;
//             ctx.beginPath();
//             ctx.moveTo(width / 2 - 5, screenY);
//             ctx.lineTo(width / 2 + 5, screenY);
//             ctx.stroke();
//             ctx.fillText(y.toString(), width / 2 - 20, screenY + 5);
//         }
        
//         // Draw the function
//         ctx.strokeStyle = 'blue';
//         ctx.lineWidth = 2;
//         ctx.beginPath();
        
//         const func = math.compile(funcStr);
//         let firstPoint = true;
        
//         for (let screenX = 0; screenX < width; screenX++) {
//             const x = xMin + (screenX / width) * (xMax - xMin);
//             try {
//                 const y = func.evaluate({ x });
                
//                 // Skip non-finite values (asymptotes)
//                 if (!isFinite(y)) {
//                     firstPoint = true;
//                     continue;
//                 }
                
//                 // Convert y to screen coordinates
//                 const screenY = height - ((y + yRange) / (2 * yRange)) * height;
                
//                 if (firstPoint) {
//                     ctx.moveTo(screenX, screenY);
//                     firstPoint = false;
//                 } else {
//                     ctx.lineTo(screenX, screenY);
//                 }
//             } catch (e) {
//                 firstPoint = true;
//             }
//         }
        
//         ctx.stroke();
        
//         // Save as PNG
//         const graphPath = `graph_${Date.now()}.png`;
//         fs.writeFileSync(graphPath, canvas.toBuffer('image/png'));
//         return graphPath;
//     } catch (e) {
//         console.error('Error creating graph:', e);
//         return null;
//     }
// }

// // Function to create a PDF with the solution and graph
// function createPDF(solution, graphPath, outputPath) {
//     const doc = new PDFDocument();
//     doc.pipe(fs.createWriteStream(outputPath));
    
//     // Add title
//     doc.fontSize(20).text(`Math Function Solution: ${solution.type}`, { align: 'center' });
//     doc.moveDown();
    
//     // Add solution details
//     doc.fontSize(14).text(solution.description);
//     doc.moveDown();
    
//     if (solution.roots) {
//         doc.text(`Roots: ${solution.roots.join(', ')}`);
//         doc.moveDown();
//     }
    
//     if (solution.properties) {
//         doc.text('Properties:');
//         for (const [key, value] of Object.entries(solution.properties)) {
//             doc.text(`- ${key}: ${value}`);
//         }
//         doc.moveDown();
//     }
    
//     doc.text(solution.evaluation);
//     doc.moveDown();
    
//     // Add the graph image
//     if (graphPath && fs.existsSync(graphPath)) {
//         doc.image(graphPath, {
//             fit: [400, 300],
//             align: 'center',
//             valign: 'center'
//         });
//     }
    
//     doc.end();
//     return outputPath;
// }

// // Handle incoming messages
// bot.on('message', async (msg) => {
//     const chatId = msg.chat.id;
//     const userInput = msg.text;
    
//     if (!userInput || !userInput.includes('x')) {
//         return bot.sendMessage(chatId, 'Please enter a function of x, like "2*x + 3" or "sin(x)"');
//     }
    
//     try {
//         // Identify the function type
//         const funcType = identifyFunction(userInput);
        
//         if (funcType === 'invalid') {
//             return bot.sendMessage(chatId, 'Invalid function format. Please enter a valid mathematical function.');
//         }
        
//         // Send processing message
//         await bot.sendMessage(chatId, `Processing your ${funcType} function: ${userInput}...`);
        
//         // Solve the function
//         const solution = solveFunction(userInput, funcType);
        
//         if (solution.error) {
//             return bot.sendMessage(chatId, `Error: ${solution.error}`);
//         }
        
//         // Create graph
//         const graphPath = createGraph(userInput);
        
//         // Create PDF
//         const pdfPath = `solution_${Date.now()}.pdf`;
//         createPDF(solution, graphPath, pdfPath);
        
//         // Send the PDF
//         await bot.sendDocument(chatId, fs.readFileSync(pdfPath), {}, {
//             filename: `math_solution_${userInput.replace(/[^a-z0-9]/gi, '_')}.pdf`,
//             contentType: 'application/pdf'
//         });
        
//         // Clean up temporary files
//         if (graphPath) fs.unlinkSync(graphPath);
//         fs.unlinkSync(pdfPath);
        
//     } catch (error) {
//         console.error('Error:', error);
//         bot.sendMessage(chatId, 'An error occurred while processing your function. Please try again.');
//     }
// });

// console.log('Math bot is running...');




require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const math = require('mathjs');
const { createCanvas } = require('canvas');
const fs = require('fs').promises;
const fsSync = require('fs');
const PDFDocument = require('pdfkit');

// Validate environment variables
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN missing in .env file');
  process.exit(1);
}

// Initialize bot with enhanced configuration
const bot = new TelegramBot(token, {
  polling: {
    params: { timeout: 30 },
    autoStart: false
  }
});

// Error handling middleware
bot.on('polling_error', (error) => {
  console.error(`📡 Polling Error: ${error.message}`);
});

// Bot connection verification
async function verifyBotConnection() {
  try {
    const { username, id } = await bot.getMe();
    console.log(`🤖 Connected as @${username} (ID: ${id})`);
    return true;
  } catch (error) {
    console.error(`🔌 Connection Failed: ${error.message}`);
    process.exit(1);
  }
}

// Function type identification
function identifyFunction(funcStr) {
  try {
    const node = math.parse(funcStr);
    const trigFuncs = ['sin', 'cos', 'tan', 'cot', 'sec', 'csc'];
    const hasTrig = node.filter(n => n.isFunctionNode && trigFuncs.includes(n.fn.name)).length > 0;
    
    if (hasTrig) return 'trigonometric';
    if (funcStr.includes('^') || funcStr.includes('exp')) return 'exponential';
    if (funcStr.includes('log') || funcStr.includes('ln')) return 'logarithmic';
    
    const denominators = node.filter(n => 
      n.isOperatorNode && n.op === '/' && n.args.some(arg => arg.toString().includes('x'))
    );
    if (denominators.length > 0) return 'rational';
    
    const quadraticTerms = node.filter(n => 
      (n.isOperatorNode && n.op === '^' && n.args[0].toString() === 'x' && n.args[1].value === 2) ||
      n.toString().includes('x^2')
    );
    if (quadraticTerms.length > 0) return 'quadratic';
    
    return funcStr.includes('x') ? 'linear' : 'unknown';
  } catch (e) {
    return 'invalid';
  }
}

// Function solver
function analyzeFunction(funcStr, type) {
  try {
    const func = math.compile(funcStr);
    const solution = { type, description: '' };

    switch (type) {
      case 'linear':
        solution.roots = math.solve(funcStr, math.symbol('x'));
        solution.description = `Linear equation solution: x = ${solution.roots[0]}`;
        break;
        
      case 'quadratic':
        solution.roots = math.polynomialRoot([1, -3, 2]).map(n => n.toFixed(2));
        solution.description = `Quadratic roots: ${solution.roots.join(', ')}`;
        break;
        
      case 'exponential':
        solution.properties = {
          base: funcStr.match(/[\d.]+(?=\^)/)?.[0] || 'e',
          type: funcStr.includes('-x') ? 'Decay' : 'Growth'
        };
        solution.description = `${solution.properties.type} exponential function`;
        break;
        
      case 'logarithmic':
        solution.properties = {
          base: funcStr.includes('ln') ? 'e' : funcStr.match(/log\((\d+)/)?.[1] || 10
        };
        solution.description = `Logarithmic function (base ${solution.properties.base})`;
        break;
        
      case 'rational':
        const denom = funcStr.split('/')[1];
        solution.asymptotes = denom ? math.solve(denom, 'x') : [];
        solution.description = solution.asymptotes.length ? 
          `Vertical asymptotes at x = ${solution.asymptotes.join(', ')}` : 
          'Rational function analysis';
        break;
        
      case 'trigonometric':
        const trigFunc = funcStr.match(/(sin|cos|tan|cot|sec|csc)/)?.[0] || 'unknown';
        solution.properties = {
          function: trigFunc,
          period: ['sin', 'cos'].includes(trigFunc) ? '2π' : 'π'
        };
        solution.description = `${trigFunc} function (period: ${solution.properties.period})`;
        break;
        
      default:
        solution.description = 'General function analysis';
    }

    solution.evaluation = {
      f0: func.evaluate({ x: 0 }).toFixed(2),
      f1: func.evaluate({ x: 1 }).toFixed(2)
    };
    
    return solution;
  } catch (error) {
    return { error: `Analysis failed: ${error.message}` };
  }
}

// Graph generator
async function generateFunctionGraph(funcStr) {
  try {
    const canvas = createCanvas(600, 400);
    const ctx = canvas.getContext('2d');
    
    // Setup canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 600, 400);
    
    // Draw axes
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(0, 200);
    ctx.lineTo(600, 200);
    ctx.moveTo(300, 0);
    ctx.lineTo(300, 400);
    ctx.stroke();
    
    // Plot function
    ctx.strokeStyle = '#2196F3';
    ctx.beginPath();
    const func = math.compile(funcStr);
    
    for (let x = -15; x <= 15; x += 0.1) {
      try {
        const y = func.evaluate({ x });
        const plotX = 300 + x * 20;
        const plotY = 200 - y * 20;
        ctx.lineTo(plotX, plotY);
      } catch {
        ctx.moveTo(300 + (x + 0.1) * 20, 200);
      }
    }
    ctx.stroke();
    
    // Save to file
    const graphPath = `graph_${Date.now()}.png`;
    await fs.writeFile(graphPath, canvas.toBuffer('image/png'));
    return graphPath;
  } catch (error) {
    console.error('Graph generation error:', error);
    return null;
  }
}

// PDF generator
async function generateAnalysisPDF(solution, graphPath) {
  return new Promise((resolve, reject) => {
    const pdfPath = `analysis_${Date.now()}.pdf`;
    const doc = new PDFDocument();
    const stream = fsSync.createWriteStream(pdfPath);
    
    doc.pipe(stream);
    doc.font('Helvetica-Bold').fontSize(20).text('Function Analysis Report', { align: 'center' });
    doc.moveDown(0.5);
    
    doc.font('Helvetica').fontSize(14)
      .text(`Function Type: ${solution.type}`)
      .moveDown(0.5)
      .text(solution.description);
    
    if (solution.roots) {
      doc.text(`Roots: ${solution.roots.join(', ')}`).moveDown(0.5);
    }
    
    if (solution.properties) {
      doc.text('Properties:');
      Object.entries(solution.properties).forEach(([key, value]) => {
        doc.text(`- ${key}: ${value}`);
      });
      doc.moveDown(0.5);
    }
    
    doc.text(`Evaluations: f(0) = ${solution.evaluation.f0}, f(1) = ${solution.evaluation.f1}`);
    
    if (graphPath) {
      doc.moveDown().image(graphPath, { 
        fit: [400, 250], 
        align: 'center' 
      });
    }
    
    doc.end();
    
    stream.on('finish', () => resolve(pdfPath));
    stream.on('error', reject);
  });
}

// Message handler
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text?.trim();
  let graphPath, pdfPath;

  try {
    if (!messageText?.includes('x')) {
      return await bot.sendMessage(chatId, '📝 Please send a mathematical function containing x\nExample: 2*x + 3 or sin(x)');
    }

    // Analysis workflow
    const funcType = identifyFunction(messageText);
    if (funcType === 'invalid') {
      return await bot.sendMessage(chatId, '❌ Invalid function format');
    }

    await bot.sendChatAction(chatId, 'typing');
    const solution = analyzeFunction(messageText, funcType);
    
    if (solution.error) {
      return await bot.sendMessage(chatId, solution.error);
    }

    // Generate visual assets
    await bot.sendChatAction(chatId, 'upload_photo');
    graphPath = await generateFunctionGraph(messageText);
    
    await bot.sendChatAction(chatId, 'upload_document');
    pdfPath = await generateAnalysisPDF(solution, graphPath);

    // Send result
    await bot.sendDocument(chatId, pdfPath, {
      filename: `Function_Analysis_${messageText.slice(0, 15)}.pdf`,
      caption: `🔍 Analysis of: ${messageText}`
    });

  } catch (error) {
    console.error('Processing error:', error);
    await bot.sendMessage(chatId, '⚠️ Error processing your request. Please try again.');
  } finally {
    // Cleanup files
    await Promise.allSettled([
      graphPath && fs.unlink(graphPath).catch(() => {}),
      pdfPath && fs.unlink(pdfPath).catch(() => {})
    ]);
  }
});

// Log bot info
bot.getMe().then((me) => {
  console.log(`Bot ${me.username} is running...`);
});

// Startup sequence
(async () => {
  await verifyBotConnection();
  bot.startPolling();
  console.log('🚀 Bot server operational');
})();