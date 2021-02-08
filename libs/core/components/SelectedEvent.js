ns('boc.components');

// This occurs when an entity has been identified and the cursor is on that entity
// target {string} entity id
boc.components.SelectedEvent = function (obj) {
    this.target = obj;
    this.className = function () { return 'SelectedEvent'; }
};