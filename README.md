# 🎵 Metrônomo

Um metrônomo web feito com **HTML, CSS e JavaScript puro** — sem dependências, sem build, só abrir e usar. Inclui um modo de **aceleração gradual** que aumenta o andamento automaticamente.

**🔗 Acesse online:** https://fernando-fix.github.io/metronomo/

---

## ✨ Funcionalidades

- **Controle de BPM** de 30 a 300 (slider + botões `−` / `+`)
- **Compassos** 2/4, 3/4, 4/4 e 6/8, com **acento na primeira batida**
- **Aceleração gradual**: aumenta `+X` BPM a cada `N` compassos até atingir o **BPM alvo** e depois mantém
- **Indicador visual** pulsante da batida atual
- **Volume** com slider e botão de **mudo**
- **Atalho de teclado**: barra de **Espaço** para iniciar/parar
- **Configurações salvas** automaticamente no `localStorage`
- Som gerado via **Web Audio API** com agendamento preciso (sem atraso/deriva)

---

## 🚀 Como usar

### Localmente

Basta abrir o arquivo `index.html` no navegador.

### Online

Acesse: **https://fernando-fix.github.io/metronomo/**

---

## 🎛️ Como usar a aceleração gradual

1. Ative o interruptor **"Aceleração gradual"**.
2. Defina o **BPM final** (ex: `160`).
3. Defina o **Incremento** em BPM (ex: `+2`).
4. Defina **a cada N compassos** o quanto sobe (ex: a cada `4` compassos).
5. Clique em **Iniciar**. O BPM sobe progressivamente até o alvo e depois se mantém.

---

## 📁 Estrutura do projeto

```
metronomo/
├── index.html   # Estrutura da interface
├── style.css    # Estilo (tema escuro, responsivo)
├── script.js    # Lógica de áudio, temporização e aceleração
└── README.md
```

---

## 📄 Licença

Este projeto está licenciado sob a **Licença MIT**. Você pode usar, copiar, modificar e distribuir livremente.

```
MIT License

Copyright (c) 2026 Fernando

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
