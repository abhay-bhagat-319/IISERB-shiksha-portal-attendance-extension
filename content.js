// content.js - Accurate & Fast Version

async function fastSync() {
    const rows = document.querySelectorAll('#dataTable tbody tr');
    const modal = document.querySelector('#MyCourseAttendance');
    const closeBtn = modal?.querySelector('.modal-close');

    for (let row of rows) {
        // Get the Course ID from the first cell (e.g., BIO202X)
        const courseId = row.cells[0]?.innerText.trim();
        const attendanceBtn = row.querySelector('a[ng-click^="getAttendanceData"]');
        const cell = row.querySelector('.ext-attendance-cell');
        
        if (attendanceBtn && cell && courseId) {
            cell.innerHTML = `<i>Syncing...</i>`;
            attendanceBtn.click();
            
            let validated = false;
            // Poll for up to 1.5 seconds to ensure the Modal matches the Row
            for (let i = 0; i < 30; i++) { 
                const modalTitle = modal.querySelector('strong')?.nextSibling?.textContent || "";
                
                // VALIDATION: Does the modal title contain our Course ID?
                if (modalTitle.includes(courseId)) {
                    const attendanceRows = modal.querySelectorAll('.modal-body tbody tr');
                    if (attendanceRows.length > 0) {
                        let present = 0;
                        attendanceRows.forEach(r => {
                            if (r.cells[1]?.innerText.trim() === "Present") present++;
                        });
                        
                        const total = attendanceRows.length;
                        const percent = ((present / total) * 100).toFixed(1);
                        const color = percent >= 75 ? '#00c853' : '#ff3d00';
                        
                        cell.innerHTML = `<b style="color: ${color}">${percent}%</b> <small style="color:#666">(${present}/${total})</small>`;
                        validated = true;
                        break; 
                    }
                }
                await new Promise(r => setTimeout(r, 50)); 
            }

            if (!validated) cell.innerHTML = `<span style="color:orange">Timeout</span>`;
            if (closeBtn) closeBtn.click();
            await new Promise(r => setTimeout(r, 150)); // Cooldown to let portal UI reset
        }
    }
}

function injectUI() {
    const table = document.querySelector('#dataTable');
    if (!table || document.querySelector('.ext-attendance-header')) return;

    const headerRow = table.querySelector('thead tr');
    const th = document.createElement('td');
    th.innerHTML = "<b>Live Attendance</b>";
    th.className = "ext-attendance-header";
    th.style = "color: #00bcd4; border-bottom: 1px solid #ddd; padding: 10px;";
    headerRow.appendChild(th);

    table.querySelectorAll('tbody tr').forEach(row => {
        const td = document.createElement('td');
        td.className = "ext-attendance-cell";
        td.style = "border-bottom: 1px solid #ddd; padding: 10px;";
        td.innerHTML = `<span style="color: #ccc;">...</span>`;
        row.appendChild(td);
    });
    
    fastSync();
}

// Re-run if the user navigates back to 'My Courses'
const observer = new MutationObserver(() => {
    if (document.querySelector('#dataTable') && !document.querySelector('.ext-attendance-header')) {
        injectUI();
    }
});

observer.observe(document.body, { childList: true, subtree: true });