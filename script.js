// Entry System Functionality
document.addEventListener('DOMContentLoaded', function() {
  const entryForm = document.getElementById('entryForm');
  const entriesTableBody = document.getElementById('entriesTableBody');
  const successMessage = document.getElementById('success-message');
  
  // Load existing entries from localStorage
  loadEntries();
  
  // Form submission
  entryForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form values
      const formData = {
          name: document.getElementById('name').value,
          contact: document.getElementById('contact').value,
          email: document.getElementById('email').value,
          purpose: document.getElementById('purpose').value,
          department: document.getElementById('department').value,
          person: document.getElementById('person').value,
          idProof: document.getElementById('id-proof').value,
          idNumber: document.getElementById('id-number').value,
          entryType: document.getElementById('entry-type').value,
          timestamp: new Date().toLocaleString()
      };
      
      // Save entry to localStorage
      saveEntry(formData);
      
      // Add to recent entries table
      addEntryToTable(formData);
      
      // Show success message
      successMessage.style.display = 'block';
      setTimeout(() => {
          successMessage.style.display = 'none';
      }, 3000);
      
      // Reset form
      entryForm.reset();
      
      // Send data to server (simulated)
      sendToServer(formData);
  });
  
  // QR Code Scanner
  if(document.getElementById('qr-reader')) {
      const html5QrCode = new Html5Qrcode("qr-reader");
      const qrResult = document.getElementById('qr-result');
      
      const qrCodeSuccessCallback = (decodedText, decodedResult) => {
          qrResult.innerHTML = `Scanned: ${decodedText}`;
          
          // Auto-fill form if QR contains JSON data
          try {
              const qrData = JSON.parse(decodedText);
              if(qrData.name) document.getElementById('name').value = qrData.name;
              if(qrData.contact) document.getElementById('contact').value = qrData.contact;
              if(qrData.email) document.getElementById('email').value = qrData.email;
              if(qrData.department) document.getElementById('department').value = qrData.department;
              if(qrData.idNumber) document.getElementById('id-number').value = qrData.idNumber;
              
              // Set purpose to student or faculty based on QR data
              if(qrData.role === 'student' || qrData.role === 'faculty') {
                  document.getElementById('purpose').value = qrData.role;
              }
          } catch (e) {
              console.log("QR doesn't contain form data");
          }
          
          // Stop scanning after success
          html5QrCode.stop().then(() => {
              console.log("QR Code scanning stopped.");
          }).catch((err) => {
              console.log("Unable to stop scanning.", err);
          });
      };
      
      const config = { fps: 10, qrbox: 250 };
      
      // Start scanning
      html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback)
          .catch((err) => {
              console.log(`Unable to start scanning, error: ${err}`);
          });
  }
  
  // Function to save entry to localStorage
  function saveEntry(entry) {
      let entries = JSON.parse(localStorage.getItem('universityEntries') || '[]');
      entries.push(entry);
      localStorage.setItem('universityEntries', JSON.stringify(entries));
  }
  
  // Function to load entries from localStorage
  function loadEntries() {
      let entries = JSON.parse(localStorage.getItem('universityEntries') || '[]');
      entries.forEach(entry => {
          addEntryToTable(entry);
      });
  }
  
  // Function to add entry to the table
  function addEntryToTable(entry) {
      const row = document.createElement('tr');
      
      row.innerHTML = `
          <td>${entry.name}</td>
          <td>${entry.contact}</td>
          <td>${entry.purpose}</td>
          <td>${entry.department || '-'}</td>
          <td>${entry.person || '-'}</td>
          <td>${entry.timestamp}</td>
          <td>${entry.entryType === 'entry' ? 'Entry' : 'Exit'}</td>
      `;
      
      entriesTableBody.prepend(row);
  }
  
  // Function to simulate sending data to server
  function sendToServer(data) {
      // In a real implementation, this would be an AJAX call to your backend
      console.log('Data sent to server:', data);
  }
  
  // Check if it's time to send daily report
  checkDailyReport();
});

// Scroll to entry system
function scrollToEntrySystem() {
  document.getElementById('entry-system').scrollIntoView({ behavior: 'smooth' });
}

// Daily report functionality
function checkDailyReport() {
  const lastReportDate = localStorage.getItem('lastReportDate');
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  
  if (!lastReportDate || lastReportDate !== currentDate) {
      // It's a new day, send report
      sendDailyReport();
      localStorage.setItem('lastReportDate', currentDate);
  }
}

function sendDailyReport() {
  const entries = JSON.parse(localStorage.getItem('universityEntries') || '[]');
  const today = new Date().toISOString().split('T')[0];
  
  // Filter today's entries
  const todaysEntries = entries.filter(entry => {
      const entryDate = new Date(entry.timestamp).toISOString().split('T')[0];
      return entryDate === today;
  });
  
  if (todaysEntries.length > 0) {
      // Format report
      let report = `Daily Entry/Exit Report for ${today}\n\n`;
      report += `Total Entries: ${todaysEntries.filter(e => e.entryType === 'entry').length}\n`;
      report += `Total Exits: ${todaysEntries.filter(e => e.entryType === 'exit').length}\n\n`;
      report += `Details:\n\n`;
      
      todaysEntries.forEach((entry, index) => {
          report += `${index + 1}. ${entry.name} (${entry.contact}) - ${entry.purpose} - ${entry.entryType === 'entry' ? 'Entered' : 'Exited'} at ${entry.timestamp}\n`;
          if (entry.person) report += `   Meeting with: ${entry.person}\n`;
          report += `   Department: ${entry.department || 'N/A'}\n\n`;
      });
      
      // In a real implementation, you would send this to the dean's email
      // This is a simulation
      console.log('Daily report generated and would be sent to dean@bujhansi.ac.in');
      console.log(report);
      
      // Here you would typically use an email service or backend API
      // For example:
      // sendEmail('dean@bujhansi.ac.in', `Daily Entry/Exit Report - ${today}`, report);
  }
}

// Simulate email sending (in a real app, this would be a backend API call)
function sendEmail(to, subject, body) {
  // This is just a simulation
  console.log(`Email to: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
}
// Contact Form Submission
if (document.getElementById('contactForm')) {
  document.getElementById('contactForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form values
      const formData = {
          name: document.getElementById('name').value,
          email: document.getElementById('email').value,
          phone: document.getElementById('phone').value,
          subject: document.getElementById('subject').value,
          message: document.getElementById('message').value,
          timestamp: new Date().toLocaleString()
      };
      
      // Save contact form submission (in real app, send to backend)
      let submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
      submissions.push(formData);
      localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
      
      // Show success message
      alert('Thank you for your message! We will get back to you soon.');
      
      // Reset form
      this.reset();
  });
}