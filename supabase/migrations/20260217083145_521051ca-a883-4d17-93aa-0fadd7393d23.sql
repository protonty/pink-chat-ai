
-- Drop restrictive policies
DROP POLICY IF EXISTS "Allow all access to messages" ON public.messages;
DROP POLICY IF EXISTS "Allow all access to room_members" ON public.room_members;
DROP POLICY IF EXISTS "Allow all access to rooms" ON public.rooms;

-- Create permissive policies (default is PERMISSIVE)
CREATE POLICY "Allow all messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all room_members" ON public.room_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all rooms" ON public.rooms FOR ALL USING (true) WITH CHECK (true);
