// Select all tab links and tab content boxes
const tabs = document.querySelectorAll('.tab-link');
const contents = document.querySelectorAll('.tab-content');

// Add event listener to each tab
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Remove active state from all tabs and contents
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));

    // Add active state to the clicked tab and its corresponding content
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});
