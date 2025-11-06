const carousel = document.getElementById('carousel');
const slides = carousel.children.length;
const dots = document.querySelectorAll('.dot');
let index = 0;

function showSlide(i) {
  index = (i + slides) % slides;
  carousel.style.transform = `translateX(-${index * 100}%)`;
  dots.forEach((dot, idx) => dot.classList.toggle('bg-white/30', idx === index));
}

document.getElementById('next').addEventListener('click', () => showSlide(index + 1));
document.getElementById('prev').addEventListener('click', () => showSlide(index - 1));
dots.forEach((dot, i) => dot.addEventListener('click', () => showSlide(i)));

// Auto-slide cada 5 segundos
setInterval(() => showSlide(index + 1), 3000);

// Inicializar
showSlide(0);

