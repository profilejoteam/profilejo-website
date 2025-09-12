-- إنشاء Storage Bucket للملفات
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-files', 'profile-files', true);

-- إعطاء صلاحيات للمستخدمين المسجلين
CREATE POLICY "Users can upload their own files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profile-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'profile-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'profile-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'profile-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- السماح للعموم بمشاهدة الملفات (للبروفايلات العامة)
CREATE POLICY "Public can view files" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'profile-files');