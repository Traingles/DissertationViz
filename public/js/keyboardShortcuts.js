function clearLocalStorage() {
    localStorage.clear()
}

document.onkeyup = function(e) {
    // ctrl + Space
    if (e.ctrlKey && e.which == 32) {
        clearLocalStorage()
    }
    // ctrl + shift + Z
    else if (e.ctrlKey && e.shiftKey && e.which == 90) {
        // redo
        graphUndoRedo(1)
    }
    // ctrl + Z
    else if (e.ctrlKey && e.which == 90) {
        // undo
        graphUndoRedo(-1)
    }
    // ctrl + A
    else if (e.ctrlKey && e.which == 65) {
        clickState = 0
        makeButtonActive(addButton)
    }
    // ctrl + D
    else if (e.ctrlKey && e.which == 68) {
        clickState = 1
        makeButtonActive(deleteButton)
    }
    // ctrl + W
    else if (e.ctrlKey && e.which == 87) {
        clickState = 2
        makeButtonActive(moveButton)
    }
}