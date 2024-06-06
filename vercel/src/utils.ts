export function generate() {
    let MAX_LEN = 8;
    const subset = "123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
    let id = "";
    for(let i = 0; i < MAX_LEN; i++){
        id += subset[Math.floor(Math.random() * subset.length)];
    }
    return id;
}
 