import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";
import { notifyPoints } from "./notifications.js";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let userUID = null;

// Detectar usuario autenticado
onAuthStateChanged(auth, (user) => {
  if (user) {
    userUID = user.uid;
    console.log("Usuario autenticado:", userUID);
  } else {
    console.log("No hay usuario autenticado.");
  }
});

// Elementos del DOM
const modal = document.getElementById("accion-modal");
const form = document.getElementById("accion-form");
const categoriaSpan = document.getElementById("categoria-seleccionada");
const cancelarBtn = document.getElementById("cancelar-modal");

// Inicializar evento de apertura de modal
window.addEventListener("DOMContentLoaded", () => {
  modal.classList.remove("visible");

  document.querySelectorAll(".card button").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!userUID) {
        alert("Debes iniciar sesión para registrar una acción.");
        return;
      }
      const categoria = btn.getAttribute("data-categoria");
      categoriaSpan.textContent = categoria;
      modal.classList.add("visible");
    });
  });
});

// Cancelar modal
cancelarBtn.addEventListener("click", () => {
  modal.classList.remove("visible");
  form.reset();
});

// Enviar acción
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const tipo = document.getElementById("tipo").value.trim();
  const categoria = categoriaSpan.textContent;

  if (!tipo) {
    alert("Por favor completa todos los campos.");
    return;
  }

  try {
    await addDoc(collection(db, "acciones"), {
      Tipo: tipo,
      Fecha: Timestamp.now(), // Guardamos como objeto Timestamp (sin comillas)
      Usuario: userUID,
      Puntos: 10
    });

    alert("Acción registrada con éxito");
    modal.classList.remove("visible");
    form.reset();

    await notifyPoints(10, '¡Gracias por tu contribución! 🌍');
  } catch (error) {
    alert("Error al guardar la acción: " + error.message);
    console.error("Error al guardar la acción:", error);
  }
});