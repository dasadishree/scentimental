const NEWSLETTER_FOLDER = "NEWSLETTER/";

pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
const statusEl = document.getElementById("zine-status");
const bookEl = document.getElementById("zine-book");
const controlsEl = document.getElementById("zine-controls")
const pageCountEl = document.getElementById("zine-page-count");

let pageFlip = null;
let totalPages = 0;

function updatePageCounter(currentPage = 0){
    pageCountEl.textContent = `Page ${currentPage + 1} of ${totalPages}`;
}

async function addImagePage(filename) {
    const page = document.createElement("div");
    page.className="page";
    const img = document.createElement("img");
    img.src = NEWSLETTER_FOLDER + filename;
    img.alt = `Newsletter page: ${filename}`;
    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(
            new Error(`Could not load image: ${filename}`)
        );
    });
    page.appendChild(img);
    bookEl.appendChild(page);
    totalPages++;
}

async function addPDFPages(filename){
    const pdfURL = NEWSLETTER_FOLDER + filename;
    const pdf = await pdfjsLib.getDocument(pdfURL).promise;
    for(let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++){
        const pdfPage = await pdf.getPage(pageNumber);
        const viewport = pdfPage.getViewport({scale: 1.5});
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await pdfPage.render({
            canvasContext: context,
            viewport: viewport
        }).promise;
        const page = document.createElement("div");
        page.className="page";
        page.appendChild(canvas);
        bookEl.appendChild(page);
        totalPages++;
    }
}
async function loadNewsletter() {
    try{
        const response = await fetch(
            NEWSLETTER_FOLDER + "manifest.json"
        );
        if(!response.ok){
            throw new Error("could not find NEWSLETTER/manifest.json");
        }
        const manifest = await response.json();
        if(!Array.isArray(manifest.files) || manifest.files.length === 0){
            throw new Error("Your newsletter manifest is empty");
        }
        for(const filename of manifest.files){
            const extension = filename.split(".").pop().toLowerCase();
            if(extension==="pdf"){
                await addPDFPages(filename);
            } else if(extension === "png"){
                await addImagePage(filename);
            } else{
                console.warn(`Skipping unsupported file: ${filename}`);
            }
        }
        if(totalPages===0){
            throw new Error("No newsletter pages were found");
        }
        pageFlip = new St.PageFlip(bookEl, {
            width: 550,
            height: 710,
            size: "stretch",
            minWidth: 280,
            maxWidth: 550,
            minHeight: 360,
            maxHeight: 710,
            showCover: true,
            mobileScrollSupport: false,
            drawShadow: true, 
            flippingTime: 800,
            usePortrait: true,
            startPage: 0,
            autoSize: true
        });
        const pages = bookEl.querySelectorAll(".page");
        pageFlip.loadFromHTML(pages);
        pageFlip.on("flip", (event) => {
            updatePageCounter(event.data);
        });
        statusEl.style.display = "none";
        controlsEl.hidden=false;
        updatePageCounter(0);
        document.getElementById("zine-prev").addEventListener("click", () => {
            pageFlip.flipPrev();
        });
        document.getElementById("zine-next").addEventListener("click", () => {
            pageFlip.flipNext();
        })
    } catch(error){
        console.error("Newsletter error:", error);
        statusEl.textContent = "We couldn't load the newsletter. Pls try again later";
        bookEl.innerHTML ="";
    }
}

loadNewsletter();