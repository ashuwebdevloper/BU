document.addEventListener('DOMContentLoaded', () => {
    // Initialize logs from localStorage
    let logs = JSON.parse(localStorage.getItem('entryLogs')) || [];
    const logsTable = document.getElementById('logsTable').getElementsByTagName('tbody')[0];

    // Entry Form Handler
    document.getElementById('entryForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const entryData = {
            name: this.name.value.trim(),
            rollNumber: this.rollNumber.value.trim(),
            purpose: this.purpose.value,
            entryTime: new Date().toLocaleTimeString(),
            exitTime: '-',
            duration: '-'
        };
        
        if(validateEntry(entryData)) {
            logs.push(entryData);
            updateLogs();
            this.reset();
            showAlert('Entry recorded successfully!', 'success');
        }
    });

    // Exit Form Handler
    document.getElementById('exitForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const rollNumber = this.exitRollNumber.value.trim();
        let exitRecorded = false;

        for(let i = logs.length - 1; i >= 0; i--) {
            if(logs[i].rollNumber === rollNumber && logs[i].exitTime === '-') {
                const exitTime = new Date();
                logs[i].exitTime = exitTime.toLocaleTimeString();
                logs[i].duration = calculateDuration(logs[i].entryTime, logs[i].exitTime);
                exitRecorded = true;
                break;
            }
        }

        if(exitRecorded) {
            updateLogs();
            this.reset();
            showAlert('Exit recorded successfully!', 'success');
        } else {
            showAlert('No active entry found for this ID', 'error');
        }
    });

    // Export Logs
    document.getElementById('exportTodayBtn').addEventListener('click', () => {
        const csvContent = logs.map(log => 
            `${log.name},${log.rollNumber},${log.entryTime},${log.exitTime},${log.purpose},${log.duration}`
        ).join('\n');
        
        const blob = new Blob([`Name,ID,Entry Time,Exit Time,Purpose,Duration\n${csvContent}`], 
            { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `entry_logs_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        showAlert('Logs exported successfully!', 'success');
    });

    // Send Report
    document.getElementById('sendNowBtn').addEventListener('click', () => {
        sendDailyReport();
        showAlert('Daily report sent to admin!', 'success');
    });

    // Helper Functions
    function updateLogs() {
        localStorage.setItem('entryLogs', JSON.stringify(logs));
        logsTable.innerHTML = logs.map(log => `
            <tr>
                <td>${log.name}</td>
                <td>${log.rollNumber}</td>
                <td>${log.entryTime}</td>
                <td>${log.exitTime}</td>
                <td>${log.purpose}</td>
                <td>${log.duration}</td>
            </tr>
        `).reverse().join('');
    }

    function calculateDuration(entry, exit) {
        const parseTime = time => {
            const [timePart, modifier] = time.split(' ');
            let [hours, minutes] = timePart.split(':');
            hours = parseInt(hours);
            minutes = parseInt(minutes);
            if(modifier === 'PM' && hours !== 12) hours += 12;
            if(modifier === 'AM' && hours === 12) hours = 0;
            return hours * 60 + minutes;
        };

        const entryMinutes = parseTime(entry);
        const exitMinutes = parseTime(exit);
        const duration = exitMinutes - entryMinutes;

        if(duration < 0) return 'Invalid duration';
        return `${Math.floor(duration/60)}h ${duration%60}m`;
    }

    function validateEntry(data) {
        if(!data.name || !data.rollNumber || !data.purpose) {
            showAlert('Please fill all required fields', 'error');
            return false;
        }
        return true;
    }

    function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${type}`;
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);

        setTimeout(() => alertDiv.remove(), 3000);
    }

    function sendDailyReport() {
        const reportData = {
            date: new Date().toLocaleDateString(),
            totalEntries: logs.length,
            activeEntries: logs.filter(log => log.exitTime === '-').length,
            entries: logs
        };

        // In real implementation, send to server
        console.log('Daily Report:', reportData);
        localStorage.setItem('lastReport', JSON.stringify(reportData));
    }

    // Initial load
    updateLogs();
});