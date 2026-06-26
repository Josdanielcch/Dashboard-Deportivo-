$ImagesDir = "c:\Users\Josedaniel\Documents\UNEFA\Proyecto_Lenguaje lll\Website\public\images"
if (!(Test-Path -Path $ImagesDir)) {
    New-Item -ItemType Directory -Force -Path $ImagesDir
}

$images = @{
    "court-1.jpg" = "https://lh3.googleusercontent.com/aida-public/AB6AXuCrK7kD9iB7twRwcrmMZeAd-AaejnMF-N5b18ei_MNi77qds9xXqzQu8Y07WfPMAg69oQz6WUHjEIWRolvq34BGGwZKtAjF1tnFAwTBR_mLa9OvGhwmAMJpYA-XHoZ_7ikUbuaVI6fTj1OUwTUMDaOoZ0Cl4BvO_08oXYSSoeRnflr47QDl1EKeXk3njkjQWj70rcMdhzbZyRbksyLrwML9fCW00AklWNpk6Kx0tkA3UkT2ei9FEmOTZ09Yvc51OFAPqBFnYTD8O2g"
    "court-2.jpg" = "https://lh3.googleusercontent.com/aida-public/AB6AXuAXdbdq9o3GiNN-V_l13w_uldGx60kVowaAzEAx4zZazcV5P9OayQc6b-GWQIEEcfFJokHpenceEb2K89IMGi5oMek5TIKU7S1BD0rYPxjwuzabujjBeR2sOJ5KKwmu2pRwaJPhaBosVLSv5nteo8_DlboanVkTk7Za1uHSjacYAAuRtNtbGmqt0quQGIVNLBZUQV7buWoUGRBk0C8KiosWC2qphVc3-unqe8bsjA6QXAyeTMxCpTzGALWHbz37R6hTEQWRdjyuKRQ"
    "court-3.jpg" = "https://lh3.googleusercontent.com/aida-public/AB6AXuB94KbkV0VHtWs83FMAxH31xsdN-r6945eD6mEXUX_pq4vv9ZOc3Ca_SqU93EEoXnCDJJwsdKg_j9Yy7LevuebLGgLiaVqVkysZYgoLH9QZOwnbWEp5CQWPs3LtgBMLcPjsGmgpVqLHL6L14Ce-n4yQi7jhPYrAJNLv8_A4nkvVUR8E3fZoYEOTNMS5ugsPC3_FjPBG6ycZ_k0pfWexLDEt_Te-zx_JyqpZ3ohRvJ2V69V0YW-f68kZB4aYXqW0CMtw1qS69fDrCAs"
    "court-4.jpg" = "https://lh3.googleusercontent.com/aida-public/AB6AXuDRk7imwWYwGKA7htwJtibvnLq9_ZxgVd1gyTQp6cI_x7LBHDjOpj2VSP_G86AukgyCnVRklW72jTPVluij6cbxNCDwOS7oGxNfIxs-0Fwkhtnd1ZdsJE1k75q8AJCAufLsfbJ7dCwmBDQZpxgvVt0YtzGKAPHaoJUCpnjNojxbJ8S7JpCTc4Xc9P6ulVy3XtTJydBYjieYWg_0R3urBn3CIg8XewYQfZ60rbK8kljnQXkrM8M9WXr25idkmGhrNnULMEVCXB3Yf38"
    "court-5.jpg" = "https://lh3.googleusercontent.com/aida-public/AB6AXuDA_eQMsx5tXpfa1XANsqb08FWsoQYxRwq7_7L44hOhTlQ3SAU_uHx-vqbD-RRT7oVBUDWbX5RJXEXcOfQwEBjeFoDtJRjrAB_y8SThEAOUkUgumoWoalFYcA-TFEAdS0LmsyZM-jc6jYRW0f6EUIpZrIg5t3y29iHKLRPGsKixsJYN2mtsnmNgBfJd4IW-PW3kxP2xJK1m4dE6GpYDOPTtwFYjOb9MGSfXZam6POEndF0TS80gWWNjdC5nC2roXpZmAWG9IHy6suU"
    "ad-protip.jpg" = "https://lh3.googleusercontent.com/aida-public/AB6AXuDOMZdAxBcXSJf_JwBnqwgeP1ogZ8_rVejyzCOVOxUUx0eu0imfhiJEzfdbRgIUYm7_jZ3Bm1J2N8tg2UlCFrUgc5AYdkvmxQSHd9w4kuonYCuxMCSKejRcT6SYAnKCRnXIC7JBTMLGVoezorHAUOUCLJ1MhTNB2iNdEsI2FkosqHEbNkXqkf9tkKqXdE0upcLpDtnJolSBSKPWOdiFNAtu5LGbKyRNEVShuh6OhYZ_H61AVbYk38FaqCUIxMmn0nB8444PHtBf0-M"
    "sport-padel.jpg" = "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=1000&auto=format&fit=crop"
    "sport-tenis.jpg" = "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=1000&auto=format&fit=crop"
    "sport-futbol.jpg" = "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000&auto=format&fit=crop"
    "sport-basquet.jpg" = "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000&auto=format&fit=crop"
}

foreach ($item in $images.GetEnumerator()) {
    $filePath = Join-Path -Path $ImagesDir -ChildPath $item.Key
    Write-Host "Downloading $($item.Key)..."
    Invoke-WebRequest -Uri $item.Value -OutFile $filePath
}
Write-Host "Done downloading all images."
