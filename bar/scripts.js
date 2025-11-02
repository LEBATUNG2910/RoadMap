const dropdown = document.getElementById('myDropdown');
const header = dropdown.querySelector('.dropdown-header');
const selectedText = dropdown.querySelector('.selected-text');
const items = dropdown.querySelectorAll('.dropdown-list li');

/**
 * Toggles the open/closed state of the dropdown.
 */
function toggleDropdown() {
    dropdown.classList.toggle('open');
    header.classList.toggle('open'); // Apply header specific open styling
}

// 1. Toggle Open/Close State on Header Click
header.addEventListener('click', toggleDropdown);

// 2. Handle Item Selection
items.forEach(item => {
    item.addEventListener('click', function() {
        // A. Update the header text
        const newText = this.textContent;
        selectedText.textContent = newText;
        
        // B. Remove 'selected' class from all items
        items.forEach(i => i.classList.remove('selected'));
        
        // C. Add 'selected' class to the clicked item
        this.classList.add('selected');

        // D. Close the dropdown
        dropdown.classList.remove('open');
        header.classList.remove('open');
    });
});

// 3. Close Dropdown on Outside Click (Crucial UX)
document.addEventListener('click', (event) => {
    // Check if the click occurred outside the entire dropdown container
    if (!dropdown.contains(event.target)) {
        dropdown.classList.remove('open');
        header.classList.remove('open');
    }
});