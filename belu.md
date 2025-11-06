                                    <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"><svg
                                            xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round"
                                            class="lucide lucide-download h-4 w-4 mr-2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="7 10 12 15 17 10"></polyline>
                                            <line x1="12" x2="12" y1="15" y2="3"></line>
                                        </svg>Exportar
                                    </button>--- HTML

<!--script de btn exportar-->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js"></script>

            <script>
            document.addEventListener("DOMContentLoaded", () => {
                // Busca el botón que diga "Exportar"
                const exportBtn = [...document.querySelectorAll("button")]
                .find(el => el.textContent.trim().toLowerCase().includes("exportar"));


                if (exportBtn) {
                exportBtn.addEventListener("click", () => {
                    // Selecciona solo el contenido sin header y nav
                    const element = document.querySelector("main") || document.body;

                    const opt = {
                    margin: 0,
                    filename: "pantalla-completa.pdf",
                    image: { type: "jpeg", quality: 1 },
                    html2canvas: { scale: 2 }, 
                    jsPDF: { 
                        unit: "px", 
                        format: [1491.2, 1872.68], // tamaño exacto de tu pantalla
                        orientation: "portrait"
                    }
                    };

                    html2pdf().set(opt).from(element).save();
                });
                }
            });
            </script>
 
