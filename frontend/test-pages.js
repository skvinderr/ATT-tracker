// Test script to verify all pages exist
console.log('Testing page navigation...');

// List of all pages that should exist
const expectedPages = [
    'loginPage',
    'registerPage', 
    'forgotPasswordPage',
    'dashboardPage',
    'markAttendancePage',
    'profilePage',
    'reportsPage',
    'timetablePage',
    'timetablesPage',
    'studentsPage',
    'subjectsPage'
];

// Check if all pages exist in the DOM
const missingPages = [];
const existingPages = [];

expectedPages.forEach(pageId => {
    const page = document.getElementById(pageId);
    if (page) {
        existingPages.push(pageId);
        console.log(`✅ ${pageId} exists`);
    } else {
        missingPages.push(pageId);
        console.log(`❌ ${pageId} missing`);
    }
});

console.log(`\nSummary:`);
console.log(`✅ Existing pages: ${existingPages.length}`);
console.log(`❌ Missing pages: ${missingPages.length}`);

if (missingPages.length === 0) {
    console.log('\n🎉 All pages exist! Navigation errors should be fixed.');
} else {
    console.log('\n⚠️ Some pages are still missing:', missingPages);
}

// Test navigation functions
console.log('\nTesting navigation functions...');
try {
    // Test if showPage function exists
    if (typeof showPage === 'function') {
        console.log('✅ showPage function exists');
    } else {
        console.log('❌ showPage function missing');
    }
    
    // Test if PageManager exists
    if (typeof PageManager === 'object') {
        console.log('✅ PageManager object exists');
    } else {
        console.log('❌ PageManager object missing');
    }
} catch (error) {
    console.log('❌ Error testing navigation:', error);
}
