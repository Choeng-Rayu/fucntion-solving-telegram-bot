let name = "rayu"
console.log(name);











































// const PDFDocument = require('pdfkit');
// const fs = require('fs');
// // Create a document
// const doc = new PDFDocument();

// // Pipe its output to a file
// doc.pipe(fs.createWriteStream('output.pdf'));

// // Add content
// doc.fontSize(25).text('Hello World!', 100, 100);
// doc.fontSize(14).text('This is a PDF document created with PDFKit.', 100, 130);

// // Add an image
// // doc.image('path/to/image.png', {
// //   fit: [250, 300],
// //   align: 'center',
// //   valign: 'center'
// // });

// // Add a table (manual implementation)
// function addTable(doc) {
//   const table = {
//     headers: ['Name', 'Age', 'Country'],
//     rows: [
//       ['John', '30', 'USA'],
//       ['Jane', '25', 'Canada'],
//       ['Bob', '40', 'UK']
//     ]
//   };
  
//   let y = 200;
//   // Headers
//   doc.font('Helvetica-Bold');
//   doc.text(table.headers[0], 100, y);
//   doc.text(table.headers[1], 200, y);
//   doc.text(table.headers[2], 300, y);
  
//   // Rows
//   doc.font('Helvetica');
//   table.rows.forEach(row => {
//     y += 30;
//     doc.text(row[0], 100, y);
//     doc.text(row[1], 200, y);
//     doc.text(row[2], 300, y);
//   });
// }

// addTable(doc);

// // Finalize the PDF and end the stream
// doc.end();
// console.log(' PDF is created successfully!');












