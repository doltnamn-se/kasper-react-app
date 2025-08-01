-- Fix the get_promotional_codes_with_customers function
CREATE OR REPLACE FUNCTION public.get_promotional_codes_with_customers()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'id', pc.id,
            'code', pc.code,
            'assigned_to', pc.assigned_to,
            'assigned_at', pc.assigned_at,
            'status', pc.status,
            'created_at', pc.created_at,
            'updated_at', pc.updated_at,
            'notes', pc.notes,
            'customer', CASE 
                WHEN c.id IS NOT NULL THEN json_build_object(
                    'id', c.id,
                    'profile', CASE 
                        WHEN p.id IS NOT NULL THEN json_build_object(
                            'display_name', p.display_name,
                            'email', p.email
                        )
                        ELSE NULL
                    END
                )
                ELSE NULL
            END
        )
    ) INTO result
    FROM promotional_codes pc
    LEFT JOIN customers c ON pc.assigned_to = c.id
    LEFT JOIN profiles p ON c.id = p.id
    ORDER BY pc.created_at DESC;
    
    RETURN COALESCE(result, '[]'::json);
END;
$function$