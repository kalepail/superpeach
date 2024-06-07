export function formatDate() {
    const date = new Date(); // Get current date
    const day = date.getDate().toString().padStart(2, '0'); // Get day and pad with zero if needed
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Get month, add 1 (January is 0), and pad
    const year = date.getFullYear(); // Get full year
    
    return `${day}/${month}/${year}`; // Return the formatted date
}

export function arraysEqual(arr1: Uint8Array, arr2: Uint8Array) {
    return (
        arr1?.length === arr2?.length &&
        arr1.every((value, index) => value === arr2[index])
    );
}