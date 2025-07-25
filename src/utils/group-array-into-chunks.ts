export default function groupArrayIntoChunks(arr: any[], chunkSize: number) {
    const groupedArray = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        groupedArray.push(chunk);
    }
    return groupedArray;
}