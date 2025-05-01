document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const scannerPlaceholder = document.getElementById('scannerPlaceholder');
    const statusText = document.getElementById('statusText');
    const statusIndicator = document.getElementById('statusIndicator');
    const verificationResult = document.getElementById('verificationResult');
    const resultContent = document.getElementById('resultContent');
    const newVerificationBtn = document.getElementById('newVerificationBtn');
    const entriesTableBody = document.getElementById('entriesTableBody');
    const refreshBtn = document.getElementById('refreshBtn');
    const exportBtn = document.getElementById('exportBtn');
    const entryBtn = document.getElementById('entryBtn');
    const exitBtn = document.getElementById('exitBtn');
    
    // State variables
    let currentAction = 'entry';
    let verificationInProgress = false;
    let verifiedUser = null;
    
    // Sample user database
    const userDatabase = [
        {
            id: 'BU2021001',
            name: 'Rajesh Kumar',
            department: 'Computer Science',
            role: 'Student',
            thumbId: 'thumb001',
            email: 'rajesh.kumar@bujhansi.ac.in'
        },
        {
            id: 'BU2021002',
            name: 'Priya Sharma',
            department: 'Mathematics',
            role: 'Faculty',
            thumbId: 'thumb002',
            email: 'priya.sharma@bujhansi.ac.in'
        },
        {
            id: 'BU2021003',
            name: 'Amit Patel',
            department: 'Physics',
            role: 'Staff',
            thumbId: 'thumb003',
            email: 'amit.patel@bujhansi.ac.in'
        },
        {
            id: 'BU2021004',
            name: 'Neha Gupta',
            department: 'Chemistry',
            role: 'Student',
            thumbId: 'thumb004',
            email: 'neha.gupta@bujhansi.ac.in'
        }
    ];
    
    // Initialize
    loadRecentEntries();
    setupEventListeners();
    setupDailyReport();
    
    function setupEventListeners() {
        // FAQ functionality
        const faqQuestions = document.querySelectorAll('.faq-question');
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                question.classList.toggle('active');
                const answer = question.nextElementSibling;
                answer.classList.toggle('show');
            });
        });
        
        // Thumb verification
        scannerPlaceholder.addEventListener('click', startVerification);
        newVerificationBtn.addEventListener('click', resetVerification);
        
        // Entry/Exit toggle
        entryBtn.addEventListener('click', () => setAction('entry'));
        exitBtn.addEventListener('click', () => setAction('exit'));
        
        // Table actions
        refreshBtn.addEventListener('click', loadRecentEntries);
        exportBtn.addEventListener('click', exportData);
    }
    
    function setAction(action) {
        currentAction = action;
        entryBtn.classList.toggle('active', action === 'entry');
        exitBtn.classList.toggle('active', action === 'exit');
        statusText.textContent = 'Ready to Scan';
        resetScannerUI();
    }
    
    function startVerification() {
        if (verificationInProgress) return;
        
        verificationInProgress = true;
        statusText.textContent = 'Scanning...';
        statusIndicator.style.backgroundColor = 'orange';
        
        // Show scanning animation
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            statusIndicator.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(interval);
                verifyThumbprint();
            }
        }, 200);
        
        // Disable scanner during process
        scannerPlaceholder.style.pointerEvents = 'none';
        scannerPlaceholder.style.opacity = '0.7';
    }
    
    function verifyThumbprint() {
        // Simulate API call delay
        setTimeout(() => {
            // Randomly select a user for demo purposes
            verifiedUser = userDatabase[Math.floor(Math.random() * userDatabase.length)];
            const isSuccess = Math.random() < 0.9; // 90% success rate for demo
            
            if (isSuccess) {
                completeVerification();
            } else {
                failVerification();
            }
        }, 1000);
    }
    
    function completeVerification() {
        statusText.textContent = 'Verification Successful';
        statusIndicator.style.backgroundColor = 'green';
        
        // Show user details and purpose form
        resultContent.innerHTML = `
            <div class="user-details">
                <h3>Verified User Details</h3>
                <p><strong>Name:</strong> ${verifiedUser.name}</p>
                <p><strong>ID:</strong> ${verifiedUser.id}</p>
                <p><strong>Department:</strong> ${verifiedUser.department}</p>
                <p><strong>Role:</strong> ${verifiedUser.role}</p>
            </div>
            <form id="purposeForm">
                <div class="form-group">
                    <label for="purpose">Purpose of Visit:</label>
                    <select id="purpose" name="purpose" required>
                        <option value="">Select Purpose</option>
                        <option value="academic">Academic Work</option>
                        <option value="research">Research</option>
                        <option value="administrative">Administrative</option>
                        <option value="meeting">Meeting</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="remarks">Remarks (Optional):</label>
                    <input type="text" id="remarks" name="remarks">
                </div>
                <button type="submit" class="btn" id="submitPurpose">
                    ${currentAction === 'entry' ? 'Record Entry' : 'Record Exit'}
                </button>
            </form>
        `;
        
        verificationResult.classList.remove('hidden');
        
        // Reinitialize form event listener
        document.getElementById('purposeForm').addEventListener('submit', function(e) {
            e.preventDefault();
            recordEntryExit();
        });
    }
    
    function recordEntryExit() {
        const purpose = document.getElementById('purpose').value;
        const remarks = document.getElementById('remarks').value;
        
        // Create record
        const record = {
            userId: verifiedUser.id,
            name: verifiedUser.name,
            department: verifiedUser.department,
            purpose: purpose,
            remarks: remarks,
            time: new Date().toLocaleString(),
            type: currentAction === 'entry' ? 'Entry' : 'Exit',
            method: 'Thumb'
        };
        
        // Save record
        saveEntryRecord(record);
        
        // Show confirmation
        resultContent.innerHTML = `
            <p class="success-message">
                <i class="fas fa-check-circle"></i> 
                ${record.type} recorded successfully for ${verifiedUser.name}
            </p>
            <div class="record-details">
                <p><strong>Time:</strong> ${record.time}</p>
                <p><strong>Purpose:</strong> ${record.purpose}</p>
                ${record.remarks ? `<p><strong>Remarks:</strong> ${record.remarks}</p>` : ''}
            </div>
        `;
        
        // Update table
        loadRecentEntries();
        
        // Reset after 3 seconds
        setTimeout(() => {
            resetVerification();
        }, 3000);
    }
    
    function failVerification() {
        statusText.textContent = 'Verification Failed';
        statusIndicator.style.backgroundColor = 'red';
        
        resultContent.innerHTML = `
            <p class="error-message">
                <i class="fas fa-times-circle"></i> 
                Thumbprint not recognized
            </p>
            <p>Please try again or use the manual entry system.</p>
        `;
        
        verificationResult.classList.remove('hidden');
        
        // Reset after 5 seconds
        setTimeout(() => {
            resetVerification();
        }, 5000);
    }
    
    function resetVerification() {
        verificationInProgress = false;
        verifiedUser = null;
        statusText.textContent = 'Ready to Scan';
        resetScannerUI();
        verificationResult.classList.add('hidden');
    }
    
    function resetScannerUI() {
        statusIndicator.style.width = '0';
        statusIndicator.style.backgroundColor = '#ccc';
        scannerPlaceholder.style.pointerEvents = 'auto';
        scannerPlaceholder.style.opacity = '1';
    }
    
    function saveEntryRecord(record) {
        let records = JSON.parse(localStorage.getItem('thumbRecords') || '[]');
        records.push(record);
        localStorage.setItem('thumbRecords', JSON.stringify(records));
        
        // In real implementation, send to backend API here
        console.log('Record saved:', record);
    }
    
    function loadRecentEntries() {
        let records = JSON.parse(localStorage.getItem('thumbRecords') || '[]');
        
        // Clear table
        entriesTableBody.innerHTML = '';
        
        // Add records to table (most recent first)
        records.reverse().forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.name}</td>
                <td>${record.department}</td>
                <td>${record.purpose}</td>
                <td>${record.time}</td>
                <td class="${record.type.toLowerCase()}">${record.type}</td>
                <td>${record.method}</td>
            `;
            entriesTableBody.appendChild(row);
        });
        
        // Show message if no records
        if (records.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="6" class="no-records">No entries/exits recorded yet</td>`;
            entriesTableBody.appendChild(row);
        }
    }
    
    function exportData() {
        let records = JSON.parse(localStorage.getItem('thumbRecords') || '[]');
        
        if (records.length === 0) {
            alert('No data to export');
            return;
        }
        
        // Convert to CSV
        let csv = 'Name,Department,Purpose,Time,Type,Method\n';
        records.forEach(record => {
            csv += `"${record.name}","${record.department}","${record.purpose}","${record.time}","${record.type}","${record.method}"\n`;
        });
        
        // Create download link
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `entry_exit_records_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    
    function setupDailyReport() {
        // Check if report already sent today
        const lastReportDate = localStorage.getItem('lastReportDate');
        const today = new Date().toDateString();
        
        if (lastReportDate !== today) {
            // Schedule daily report at 23:59
            scheduleDailyReport();
        }
        
        // Check every minute if we've crossed midnight
        setInterval(() => {
            const now = new Date();
            if (now.getHours() === 0 && now.getMinutes() === 0) {
                const today = new Date().toDateString();
                if (lastReportDate !== today) {
                    sendDailyReport();
                    localStorage.setItem('lastReportDate', today);
                }
            }
        }, 60000); // Check every minute
    }
    
    function scheduleDailyReport() {
        const now = new Date();
        const targetTime = new Date();
        
        // Set target time to 23:59 today
        targetTime.setHours(23, 59, 0, 0);
        
        // If it's already past 23:59, set for 23:59 tomorrow
        if (now > targetTime) {
            targetTime.setDate(targetTime.getDate() + 1);
        }
        
        const timeUntilReport = targetTime - now;
        
        setTimeout(() => {
            sendDailyReport();
            localStorage.setItem('lastReportDate', new Date().toDateString());
            
            // Schedule next day's report
            scheduleDailyReport();
        }, timeUntilReport);
    }
    
    function sendDailyReport() {
        const records = JSON.parse(localStorage.getItem('thumbRecords') || '[]');
        const today = new Date().toLocaleDateString();
        
        // Filter today's records
        const todayRecords = records.filter(record => {
            return new Date(record.time).toLocaleDateString() === today;
        });
        
        if (todayRecords.length === 0) {
            console.log('No records to report today');
            return;
        }
        
        // Prepare report
        let report = `Daily Entry/Exit Report for Bundelkhand University - ${today}\n\n`;
        report += `Total Entries: ${todayRecords.filter(r => r.type === 'Entry').length}\n`;
        report += `Total Exits: ${todayRecords.filter(r => r.type === 'Exit').length}\n\n`;
        report += `Detailed Records:\n\n`;
        
        todayRecords.forEach((record, index) => {
            report += `${index + 1}. ${record.name} (${record.department})\n`;
            report += `   - Type: ${record.type}\n`;
            report += `   - Time: ${record.time}\n`;
            report += `   - Purpose: ${record.purpose}\n`;
            if (record.remarks) report += `   - Remarks: ${record.remarks}\n`;
            report += `\n`;
        });
        
        // In real implementation, send email to dean here
        console.log('Sending daily report to dean@bujhansi.ac.in');
        console.log(report);
        
        // Simulate email sending
        simulateEmailSend(report);
    }
    
    function simulateEmailSend(report) {
        // In a real implementation, this would use an email API
        console.log('Email sent to dean@bujhansi.ac.in at ' + new Date().toLocaleString());
        console.log('Email content:', report);
        
        // Store record of sent email
        const emailRecord = {
            to: 'dean@bujhansi.ac.in',
            subject: `Daily Entry/Exit Report - ${new Date().toLocaleDateString()}`,
            body: report,
            sentAt: new Date().toISOString()
        };
        
        let sentEmails = JSON.parse(localStorage.getItem('sentEmails') || '[]');
        sentEmails.push(emailRecord);
        localStorage.setItem('sentEmails', JSON.stringify(sentEmails));
    }
});