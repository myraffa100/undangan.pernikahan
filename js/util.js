import { AOS } from './aos.js';
import { audio } from './audio.js';
import { theme } from './theme.js';
import { comment } from './comment.js';
import { storage } from './storage.js';
import { confetti } from './confetti.js';
import { bootstrap } from './bootstrap.js';
import { request, HTTP_GET } from './request.js';

export const util = (() => {

    // Fungsi untuk mengurangi opacity elemen hingga 0 dan kemudian menghapus elemen tersebut
    const opacity = (id, speed = 0.01) => {
        const element = document.getElementById(id);
        let op = parseFloat(element.style.opacity) || 1;

        let clear = setInterval(() => {
            if (op > 0) {
                element.style.opacity = op.toString();
                op -= speed;
            } else {
                clearInterval(clear);
                element.remove();
            }
        }, 10);
    };

    // Fungsi untuk meng-escape karakter HTML untuk mencegah XSS
    const escapeHtml = (unsafe) => {
        return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    // Fungsi untuk men-disable tombol dan mengubah teksnya menjadi pesan loading
    const disableButton = (button, message = 'Loading..') => {
        button.disabled = true;
        let tmp = button.innerHTML;
        button.innerHTML = message;

        const restore = () => {
            button.innerHTML = tmp;
            button.disabled = false;
        };

        return { restore };
    };

    // Fungsi untuk menambahkan kelas animasi pada elemen SVG setelah waktu timeout tertentu
    const animate = (svg, timeout, classes) => {
        setTimeout(() => {
            svg.classList.add(classes);
        }, timeout);
    };

    // Fungsi untuk menampilkan nama tamu yang diundang berdasarkan URL parameter
    const guest = () => {
        const name = (new URLSearchParams(window.location.search)).get('to');
        const guest = document.getElementById('guest-name');

        if (!name) {
            guest.remove();
            return;
        }

        const div = document.createElement('div');
        div.classList.add('m-2');
        div.innerHTML = `<p class="mt-0 mb-1 mx-0 p-0 text-light">${guest.getAttribute('data-message')}</p><h2 class="text-light">${escapeHtml(name)}</h2>`;

        document.getElementById('form-name').value = name;
        guest.appendChild(div);
    };

    // Fungsi untuk menampilkan halaman undangan setelah loading selesai
    const show = () => {
        guest();
        opacity('loading', 0.025);
        window.scrollTo(0, 0);
    };

    // Fungsi untuk menampilkan modal gambar
    const modal = (img) => {
        document.getElementById('show-modal-image').src = img.src;
        (new bootstrap.Modal('#modal-image')).show();
    };

    // Fungsi untuk menghitung waktu mundur menuju tanggal pernikahan
// Fungsi untuk menghitung waktu mundur menuju tanggal pernikahan
const countDownDate = () => {
    const targetDate = '2024-07-06T00:00:00';  // Set tanggal pernikahan
    const count = new Date(targetDate).getTime();

    setInterval(() => {
        const now = new Date().getTime();
        const distance = count - now;

        if (distance >= 0) {
            document.getElementById('day').innerText = Math.floor(distance / (1000 * 60 * 60 * 24));
            document.getElementById('hour').innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            document.getElementById('minute').innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            document.getElementById('second').innerText = Math.floor((distance % (1000 * 60)) / 1000);
        } else {
            document.getElementById('day').innerText = 0;
            document.getElementById('hour').innerText = 0;
            document.getElementById('minute').innerText = 0;
            document.getElementById('second').innerText = 0;
        }
    }, 1000);
};

// Panggil fungsi countDownDate saat halaman dimuat
document.addEventListener('DOMContentLoaded', countDownDate);


    // Fungsi untuk menyalin teks ke clipboard
    const copy = async (button, message, timeout = 1500) => {
        try {
            await navigator.clipboard.writeText(button.getAttribute('data-copy'));
        } catch {
            alert('Failed to copy');
            return;
        }

        button.disabled = true;
        let tmp = button.innerText;
        button.innerText = message;

        let clear = setTimeout(() => {
            button.disabled = false;
            button.innerText = tmp;
        }, timeout);
    };

    // Fungsi untuk memulai animasi confetti
    const animation = () => {
        const duration = 15 * 1000;
        const animationEnd = Date.now() + duration;
        const colors = ["#FFC0CB", "#FF1493", "#C71585"];

        const randomInRange = (min, max) => {
            return Math.random() * (max - min) + min;
        };

        const heart = confetti.shapeFromPath({
            path: 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z',
            matrix: [0.03333333333333333, 0, 0, 0.03333333333333333, -5.566666666666666, -5.533333333333333]
        });

        (function frame() {
            const timeLeft = animationEnd - Date.now();

            colors.forEach((color) => {
                confetti({
                    particleCount: 1,
                    startVelocity: 0,
                    ticks: Math.max(50, 75 * (timeLeft / duration)),
                    origin: {
                        x: Math.random(),
                        y: Math.abs(Math.random() - (timeLeft / duration)),
                    },
                    zIndex: 1057,
                    colors: [color],
                    shapes: [heart],
                    drift: randomInRange(-0.5, 0.5),
                    gravity: randomInRange(0.5, 1),
                    scalar: randomInRange(0.5, 1),
                });
            });

            if (timeLeft > 0) {
                requestAnimationFrame(frame);
            }
        })();
    };

    // Fungsi untuk menyimpan konfigurasi token
    const storeConfig = async (token) => {
        storage('session').set('token', token);

        const config = storage('config');
        const res = await request(HTTP_GET, '/api/config').token(token);
        
        for (let [key, value] of Object.entries(res.data)) {
            config.set(key, value);
        }

        return res.code;
    };

    // Fungsi untuk membuka undangan dan menjalankan berbagai inisialisasi
    const open = async (button) => {
        button.disabled = true;
        confetti({ origin: { y: 1 }, zIndex: 1057 });

        document.querySelector('body').style.overflowY = 'scroll';
        if (storage('information').get('info')) {
            document.getElementById('information').remove();
        }

        const token = document.querySelector('body').getAttribute('data-key');
        if (!token || token.length === 0) {
            document.getElementById('ucapan').remove();
            document.querySelector('a.nav-link[href="#ucapan"]').closest('li.nav-item').remove();
        }

        AOS.init();

        countDownDate();
        opacity('welcome', 0.025);

        audio.play();
        audio.showButton();

        theme.check();
        theme.showButtonChangeTheme();

        if (!token || token.length === 0) {
            return;
        }

        const status = await storeConfig(token);
        if (status === 200) {
            animation();
            await comment.comment();
        }
    };

    // Fungsi untuk menutup informasi undangan
    const close = () => {
        storage('information').set('info', true);
    };

    return {
        open,
        copy,
        show,
        close,
        modal,
        opacity,
        animate,
        animation,
        escapeHtml,
        countDownDate,
        disableButton,
    };
})();
