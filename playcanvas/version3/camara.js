var Camara = pc.createScript('camara');

Camara.prototype.initialize = function() {
    console.log("🎬 CÁMARA INICIADA");
    
    this.jugador = null;
    
    // Configuración de la cámara
    this.offset = new pc.Vec3(0, 5, 8); // Posición relativa al jugador (X, Y, Z)
    this.suavidad = 5; // Qué tan suave sigue al jugador (mayor = más suave)
    this.alturaMinima = 2; // Altura mínima de la cámara
    
    // Buscar Box directamente por nombre
    this.jugador = this.app.root.findByName('Box');
    console.log("🎯 Box encontrado:", this.jugador ? "SÍ" : "NO");
    
    // Si encontró al jugador, posicionar cámara inicialmente
    if (this.jugador) {
        var pos = this.jugador.getPosition();
        this.entity.setPosition(
            pos.x + this.offset.x,
            pos.y + this.offset.y,
            pos.z + this.offset.z
        );
        this.entity.lookAt(pos);
        console.log("📹 Cámara posicionada inicialmente");
    }
};

Camara.prototype.update = function(dt) {
    if (!this.jugador) return;
    
    // Obtener posición actual del jugador
    var posJugador = this.jugador.getPosition();
    
    // Calcular posición objetivo de la cámara
    var posObjetivo = new pc.Vec3(
        posJugador.x + this.offset.x,      // Misma X que jugador + offset
        Math.max(posJugador.y + this.offset.y, this.alturaMinima), // Y con altura mínima
        posJugador.z + this.offset.z       // Z detrás del jugador
    );
    
    // Obtener posición actual de la cámara
    var posActual = this.entity.getPosition();
    
    // Interpolar suavemente hacia la posición objetivo
    var posNueva = new pc.Vec3();
    posNueva.lerp(posActual, posObjetivo, this.suavidad * dt);
    
    // Aplicar la nueva posición
    this.entity.setPosition(posNueva);
    
    // Siempre mirar hacia el jugador
    this.entity.lookAt(posJugador);
};

// NUEVA FUNCIÓN: Ajustar configuración de cámara en tiempo real
Camara.prototype.configurar = function(nuevaX, nuevaY, nuevaZ, nuevaSuavidad) {
    this.offset.set(nuevaX || 0, nuevaY || 5, nuevaZ || 8);
    this.suavidad = nuevaSuavidad || 5;
    console.log("📹 Cámara reconfigurada:", this.offset, "Suavidad:", this.suavidad);
};

// NUEVA FUNCIÓN: Cambiar a vista primera persona (experimental)
Camara.prototype.vistaPersona = function() {
    this.offset.set(0, 0.5, 0); // Muy cerca del jugador
    this.suavidad = 10;
    console.log("👁️ Cambiado a vista primera persona");
};

// NUEVA FUNCIÓN: Cambiar a vista aérea
Camara.prototype.vistaAerea = function() {
    this.offset.set(0, 15, 5); // Muy arriba
    this.suavidad = 3;
    console.log("🚁 Cambiado a vista aérea");
};

// NUEVA FUNCIÓN: Volver a vista normal
Camara.prototype.vistaNormal = function() {
    this.offset.set(0, 5, 8); // Vista por defecto
    this.suavidad = 5;
    console.log("🎮 Cambiado a vista normal");
};