import WebFont from "webfontloader";

const loadedFonts: string[] = [];

export const LoadFont = (family: string): Promise<void> => {
    return new Promise((resolve) => {
        if (loadedFonts.indexOf(family) !== -1) {
            resolve();
        } else {
            WebFont.load({
                google: {
                    families: [ family ]
                },
                active: () => {
                    loadedFonts.push(family);
                    window.setTimeout(() => {
                        resolve();
                    }, 500);
                },
                fontloading: (family) => {
                    const el = document.createElement('p');
                    el.style.fontFamily = family;
                    el.style.fontSize = "0px";
                    el.style.visibility = "hidden";
                    el.innerHTML = '.';
                    
                    document.body.appendChild(el);
                }
            });
        }
    });
}

export const LoadFonts = (...families: string[]): Promise<void> => {
    return new Promise((resolve) => {
        let count = families.length - 1;
        families.forEach((family) => {
            LoadFont(family).then(() => {
                count--;
                if (count <= 0) {
                    resolve();
                }
            });
        });
    });
}