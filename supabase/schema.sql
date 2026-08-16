


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.users (auth_id, email)
  values (new.id, new.email);
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."achievement_definitions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text",
    "description" "text",
    "xp_reward" integer DEFAULT 0,
    "badge_url" "text"
);


ALTER TABLE "public"."achievement_definitions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid" DEFAULT "gen_random_uuid"(),
    "workout_id" "uuid" DEFAULT "gen_random_uuid"(),
    "sets" smallint DEFAULT '0'::smallint,
    "reps" smallint DEFAULT '0'::smallint,
    "weight" smallint DEFAULT '0'::smallint,
    "duration" smallint DEFAULT '0'::smallint,
    "date" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sessions" OWNER TO "postgres";


COMMENT ON TABLE "public"."sessions" IS 'sessions table for groups of workouts';



CREATE TABLE IF NOT EXISTS "public"."streaks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "gen_random_uuid"(),
    "current_streak" integer DEFAULT 0,
    "longest_streak" integer DEFAULT 0,
    "last_active_date" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."streaks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_achievements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "gen_random_uuid"(),
    "achievement_id" "uuid" DEFAULT "gen_random_uuid"()
);


ALTER TABLE "public"."user_achievements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text",
    "age" smallint DEFAULT '0'::smallint,
    "sex" "text",
    "height" smallint,
    "weight" smallint,
    "xp" integer DEFAULT 0,
    "favorite_workout" "text",
    "weekly_goal" smallint DEFAULT '3'::smallint,
    "auth_id" "uuid" DEFAULT "auth"."uid"(),
    "email" "text",
    "profile_complete" boolean DEFAULT false
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON TABLE "public"."users" IS 'User''s table';



CREATE TABLE IF NOT EXISTS "public"."workouts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text",
    "type" "text",
    "is_preset" boolean,
    "user_id" "uuid" DEFAULT "gen_random_uuid"()
);


ALTER TABLE "public"."workouts" OWNER TO "postgres";


COMMENT ON TABLE "public"."workouts" IS 'workouts table';



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."achievement_definitions"
    ADD CONSTRAINT "achievement_definitions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."streaks"
    ADD CONSTRAINT "streaks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workouts"
    ADD CONSTRAINT "workouts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."streaks"
    ADD CONSTRAINT "streaks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievement_definitions"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."workouts"
    ADD CONSTRAINT "workouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



CREATE POLICY "Anyone can read achievements" ON "public"."achievement_definitions" FOR SELECT USING (true);



CREATE POLICY "Users can delete own sessions" ON "public"."sessions" FOR DELETE USING (("user_id" IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."auth_id" = "auth"."uid"()))));



CREATE POLICY "Users can delete own workouts" ON "public"."workouts" FOR DELETE USING (("user_id" IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."auth_id" = "auth"."uid"()))));



CREATE POLICY "Users can insert own achievements" ON "public"."user_achievements" FOR INSERT WITH CHECK (("user_id" IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."auth_id" = "auth"."uid"()))));



CREATE POLICY "Users can insert own sessions" ON "public"."sessions" FOR INSERT WITH CHECK (("user_id" IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."auth_id" = "auth"."uid"()))));



CREATE POLICY "Users can insert own streaks" ON "public"."streaks" FOR INSERT WITH CHECK (("user_id" IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."auth_id" = "auth"."uid"()))));



CREATE POLICY "Users can insert own workouts" ON "public"."workouts" FOR INSERT WITH CHECK (("user_id" IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."auth_id" = "auth"."uid"()))));



CREATE POLICY "Users can read own achievements" ON "public"."user_achievements" FOR SELECT USING (("user_id" IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."auth_id" = "auth"."uid"()))));



CREATE POLICY "Users can read own profile" ON "public"."users" FOR SELECT USING (("auth_id" = "auth"."uid"()));



CREATE POLICY "Users can read own sessions" ON "public"."sessions" FOR SELECT USING (("user_id" IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."auth_id" = "auth"."uid"()))));



CREATE POLICY "Users can read own streaks" ON "public"."streaks" FOR SELECT USING (("user_id" IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."auth_id" = "auth"."uid"()))));



CREATE POLICY "Users can read presets and own workouts" ON "public"."workouts" FOR SELECT USING ((("is_preset" = true) OR ("user_id" IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."auth_id" = "auth"."uid"())))));



CREATE POLICY "Users can update own profile" ON "public"."users" FOR UPDATE USING (("auth_id" = "auth"."uid"())) WITH CHECK (("auth_id" = "auth"."uid"()));



CREATE POLICY "Users can update own sessions" ON "public"."sessions" FOR UPDATE USING (("user_id" IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."auth_id" = "auth"."uid"()))));



CREATE POLICY "Users can update own streaks" ON "public"."streaks" FOR UPDATE USING (("user_id" IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."auth_id" = "auth"."uid"()))));



CREATE POLICY "Users can update own workouts" ON "public"."workouts" FOR UPDATE USING (("user_id" IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."auth_id" = "auth"."uid"()))));



ALTER TABLE "public"."achievement_definitions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."streaks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_achievements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workouts" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";


















GRANT ALL ON TABLE "public"."achievement_definitions" TO "anon";
GRANT ALL ON TABLE "public"."achievement_definitions" TO "authenticated";
GRANT ALL ON TABLE "public"."achievement_definitions" TO "service_role";



GRANT ALL ON TABLE "public"."sessions" TO "anon";
GRANT ALL ON TABLE "public"."sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."sessions" TO "service_role";



GRANT ALL ON TABLE "public"."streaks" TO "anon";
GRANT ALL ON TABLE "public"."streaks" TO "authenticated";
GRANT ALL ON TABLE "public"."streaks" TO "service_role";



GRANT ALL ON TABLE "public"."user_achievements" TO "anon";
GRANT ALL ON TABLE "public"."user_achievements" TO "authenticated";
GRANT ALL ON TABLE "public"."user_achievements" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."workouts" TO "anon";
GRANT ALL ON TABLE "public"."workouts" TO "authenticated";
GRANT ALL ON TABLE "public"."workouts" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































