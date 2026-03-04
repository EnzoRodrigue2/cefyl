export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      beca_uso_mensual: {
        Row: {
          anio: number
          id: string
          mes: number
          monto_usado: number | null
          user_id: string
        }
        Insert: {
          anio: number
          id?: string
          mes: number
          monto_usado?: number | null
          user_id: string
        }
        Update: {
          anio?: number
          id?: string
          mes?: number
          monto_usado?: number | null
          user_id?: string
        }
        Relationships: []
      }
      becas: {
        Row: {
          created_at: string | null
          documentacion_url: string | null
          estado: Database["public"]["Enums"]["beca_estado"]
          fecha_inicio: string | null
          fecha_vencimiento: string | null
          id: string
          motivo_revocacion: string | null
          tipo: Database["public"]["Enums"]["beca_tipo"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          documentacion_url?: string | null
          estado?: Database["public"]["Enums"]["beca_estado"]
          fecha_inicio?: string | null
          fecha_vencimiento?: string | null
          id?: string
          motivo_revocacion?: string | null
          tipo?: Database["public"]["Enums"]["beca_tipo"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          documentacion_url?: string | null
          estado?: Database["public"]["Enums"]["beca_estado"]
          fecha_inicio?: string | null
          fecha_vencimiento?: string | null
          id?: string
          motivo_revocacion?: string | null
          tipo?: Database["public"]["Enums"]["beca_tipo"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      configuraciones: {
        Row: {
          clave: string
          descripcion: string | null
          id: string
          updated_at: string | null
          valor: string
        }
        Insert: {
          clave: string
          descripcion?: string | null
          id?: string
          updated_at?: string | null
          valor: string
        }
        Update: {
          clave?: string
          descripcion?: string | null
          id?: string
          updated_at?: string | null
          valor?: string
        }
        Relationships: []
      }
      franjas_horarias: {
        Row: {
          activo: boolean | null
          created_at: string | null
          cupo_maximo: number
          dia_semana: number
          hora_fin: string
          hora_inicio: string
          id: string
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          cupo_maximo?: number
          dia_semana: number
          hora_fin: string
          hora_inicio: string
          id?: string
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          cupo_maximo?: number
          dia_semana?: number
          hora_fin?: string
          hora_inicio?: string
          id?: string
        }
        Relationships: []
      }
      logs: {
        Row: {
          accion: string
          created_at: string | null
          detalle: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          accion: string
          created_at?: string | null
          detalle?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          accion?: string
          created_at?: string | null
          detalle?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      movimientos_financieros: {
        Row: {
          created_at: string | null
          descripcion: string | null
          id: string
          monto: number
          orden_id: string | null
          tipo: string
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          id?: string
          monto: number
          orden_id?: string | null
          tipo: string
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          id?: string
          monto?: number
          orden_id?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_financieros_orden_id_fkey"
            columns: ["orden_id"]
            isOneToOne: false
            referencedRelation: "ordenes"
            referencedColumns: ["id"]
          },
        ]
      }
      ordenes: {
        Row: {
          archivo_nombre: string
          archivo_url: string
          cantidad_hojas: number
          cantidad_paginas: number
          color: boolean | null
          comentarios: string | null
          created_at: string | null
          descuento_beca: number | null
          doble_faz: boolean | null
          estado: Database["public"]["Enums"]["orden_estado"]
          excedente: number | null
          id: string
          monto_final: number
          precio_base: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          archivo_nombre: string
          archivo_url: string
          cantidad_hojas?: number
          cantidad_paginas?: number
          color?: boolean | null
          comentarios?: string | null
          created_at?: string | null
          descuento_beca?: number | null
          doble_faz?: boolean | null
          estado?: Database["public"]["Enums"]["orden_estado"]
          excedente?: number | null
          id?: string
          monto_final?: number
          precio_base?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          archivo_nombre?: string
          archivo_url?: string
          cantidad_hojas?: number
          cantidad_paginas?: number
          color?: boolean | null
          comentarios?: string | null
          created_at?: string | null
          descuento_beca?: number | null
          doble_faz?: boolean | null
          estado?: Database["public"]["Enums"]["orden_estado"]
          excedente?: number | null
          id?: string
          monto_final?: number
          precio_base?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pagos: {
        Row: {
          created_at: string | null
          estado: Database["public"]["Enums"]["pago_estado"]
          id: string
          metodo: string | null
          monto: number
          orden_id: string
          transaccion_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          estado?: Database["public"]["Enums"]["pago_estado"]
          id?: string
          metodo?: string | null
          monto: number
          orden_id: string
          transaccion_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          estado?: Database["public"]["Enums"]["pago_estado"]
          id?: string
          metodo?: string | null
          monto?: number
          orden_id?: string
          transaccion_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pagos_orden_id_fkey"
            columns: ["orden_id"]
            isOneToOne: false
            referencedRelation: "ordenes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          acepto_terminos: boolean | null
          carrera: string
          created_at: string | null
          dni: string
          email: string
          id: string
          nombre_completo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          acepto_terminos?: boolean | null
          carrera: string
          created_at?: string | null
          dni: string
          email: string
          id?: string
          nombre_completo: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          acepto_terminos?: boolean | null
          carrera?: string
          created_at?: string | null
          dni?: string
          email?: string
          id?: string
          nombre_completo?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      turnos: {
        Row: {
          created_at: string | null
          estado: string | null
          fecha: string
          franja_id: string | null
          hora_fin: string
          hora_inicio: string
          id: string
          orden_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          estado?: string | null
          fecha: string
          franja_id?: string | null
          hora_fin: string
          hora_inicio: string
          id?: string
          orden_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          estado?: string | null
          fecha?: string
          franja_id?: string | null
          hora_fin?: string
          hora_inicio?: string
          id?: string
          orden_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "turnos_franja_id_fkey"
            columns: ["franja_id"]
            isOneToOne: false
            referencedRelation: "franjas_horarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turnos_orden_id_fkey"
            columns: ["orden_id"]
            isOneToOne: false
            referencedRelation: "ordenes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_completed_orders: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "student"
      beca_estado: "pendiente" | "aprobada" | "rechazada" | "revocada"
      beca_tipo: "sin_beca" | "50" | "100"
      orden_estado:
        | "borrador"
        | "pendiente_pago"
        | "pagado"
        | "en_proceso"
        | "finalizada"
        | "lista_retirar"
        | "retirada"
        | "cancelada"
      pago_estado: "pendiente" | "aprobado" | "rechazado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "student"],
      beca_estado: ["pendiente", "aprobada", "rechazada", "revocada"],
      beca_tipo: ["sin_beca", "50", "100"],
      orden_estado: [
        "borrador",
        "pendiente_pago",
        "pagado",
        "en_proceso",
        "finalizada",
        "lista_retirar",
        "retirada",
        "cancelada",
      ],
      pago_estado: ["pendiente", "aprobado", "rechazado"],
    },
  },
} as const
