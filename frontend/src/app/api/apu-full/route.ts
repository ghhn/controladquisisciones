import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const partida = searchParams.get('partida');

  if (!partida) {
    return NextResponse.json({ error: 'Partida parameter is required' }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    
    // Fetch rendition and metrado_fijo from partidas_p
    const rendRes = await client.query(
      'SELECT rendimiento_p as "Partida_Rendimiento", cantidad_p as "metrado_fijo" FROM partidas_p WHERE item = $1 LIMIT 1',
      [partida]
    );
    const rendimiento = rendRes.rows[0]?.Partida_Rendimiento || 'No especificado';
    const metrado_fijo = rendRes.rows[0]?.metrado_fijo || 0;

    // Fetch all insumos for the APU from the acus table
    // tipo is derived from the DB column when available; otherwise inferred from unidad:
    //   hh  → MANO DE OBRA | hm / %mo → EQUIPO | rest → MATERIALES
    const query = `
      SELECT id, descripcion, unidad, incidencia_original, parcial_original,
             precio_original, cantidad_2, tipo
      FROM (
        SELECT MIN(id) as id,
               descripcion_insumo as descripcion,
               MAX(unidad) as unidad,
               SUM(cantidad_p) as incidencia_original,
               SUM(parcial_p) as parcial_original,
               MAX(precio_p) as precio_original,
               SUM(COALESCE(cantidad_c, cantidad_p)) as cantidad_2,
               CASE
                 WHEN UPPER(TRIM(COALESCE(MAX(tipo),''))) IN ('MATERIALES','MANO DE OBRA','EQUIPO')
                      THEN UPPER(TRIM(MAX(tipo)))
                 WHEN MAX(unidad) = 'hh'                             THEN 'MANO DE OBRA'
                 WHEN MAX(unidad) = 'hm' OR MAX(unidad) LIKE '%mo%' THEN 'EQUIPO'
                 ELSE 'MATERIALES'
               END AS tipo,
               MIN(id) as sort_orig
        FROM acus
        WHERE item_partida = $1
        GROUP BY codigo_insumo, descripcion_insumo
      ) sub
      ORDER BY
        CASE tipo
          WHEN 'MATERIALES'   THEN 0
          WHEN 'MANO DE OBRA' THEN 1
          WHEN 'EQUIPO'       THEN 2
          ELSE                     3
        END,
        sort_orig
    `;
    const result = await client.query(query, [partida]);
    client.release();
    
    return NextResponse.json({
      rendimiento,
      metrado_fijo,
      insumos: result.rows
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch apu full' }, { status: 500 });
  }
}
